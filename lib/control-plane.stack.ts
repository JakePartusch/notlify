import {
  HttpApi,
  CorsPreflightOptions,
  CorsHttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as cdk from "aws-cdk-lib";
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import {
  CfnEventBus,
  CfnEventBusPolicy,
  EventBus,
  Rule,
} from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { BlockPublicAccess, Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from "constructs";
import * as path from "path";

interface ControlPlaneStackProps extends StackProps {
  gitHubToken: string;
  gitHubWorkflowUrl: string;
  dataPlaneAccounts: string[];
  orgId: string;
}

export class ControlPlaneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ControlPlaneStackProps) {
    super(scope, id, props);
    console.log(props);

    const table = new Table(this, "ControlPlaneTable", {
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      pointInTimeRecovery: true,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "GSI1PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "GSI1SK",
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    });

    const sourceFilesBucket = new Bucket(this, "SourceFilesBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const lambda = new NodejsFunction(this, "ControlPlaneApiHandler", {
      entry: path.join(__dirname, "../src/control-plane/api.ts"),
      runtime: Runtime.NODEJS_18_X,
      memorySize: 512,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
        SOURCE_FILES_BUCKET_NAME: sourceFilesBucket.bucketName,
        GITHUB_TOKEN: props.gitHubToken,
        GITHUB_WORKFLOW_URL: props.gitHubWorkflowUrl,
      },
    });

    const httpApi = new HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowHeaders: ["*"],
        allowMethods: [CorsHttpMethod.ANY],
        allowOrigins: ["*"],
        maxAge: Duration.seconds(600),
      },
    });
    const lambdaProxyIntegration = new HttpLambdaIntegration(
      `LambdaIntegration`,
      lambda
    );

    httpApi.addRoutes({
      path: `/api`,
      integration: lambdaProxyIntegration,
    });

    new CfnOutput(this, `API Gateway`, {
      value: `https://${httpApi.apiId}.execute-api.${
        Stack.of(this).region
      }.amazonaws.com/api`,
    });

    const s3NotifyLambdaRole = new Role(
      this,
      "DeploymentInitiatedHandlerHandlerRole",
      {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );
    for (const account of props.dataPlaneAccounts) {
      s3NotifyLambdaRole.addToPolicy(
        new PolicyStatement({
          actions: ["sts:AssumeRole"],
          effect: Effect.ALLOW,
          resources: [`arn:aws:iam::${account}:role/*`],
        })
      );
    }
    sourceFilesBucket.grantRead(s3NotifyLambdaRole);

    const s3NotifyLambda = new NodejsFunction(
      this,
      "DeploymentInitiatedHandler",
      {
        entry: path.join(
          __dirname,
          "../src/control-plane/lambdas/deployment-initiated.handler.ts"
        ),
        runtime: Runtime.NODEJS_18_X,
        memorySize: 512,
        timeout: Duration.seconds(60),
        role: s3NotifyLambdaRole,
        environment: {
          TABLE_NAME: table.tableName,
          SOURCE_FILES_BUCKET_NAME: sourceFilesBucket.bucketName,
          GITHUB_TOKEN: props.gitHubToken,
          GITHUB_WORKFLOW_URL: props.gitHubWorkflowUrl,
        },
      }
    );

    sourceFilesBucket.enableEventBridgeNotification();

    sourceFilesBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(s3NotifyLambda)
    );

    sourceFilesBucket.grantWrite(lambda);
    table.grantReadWriteData(lambda);
    table.grantReadWriteData(s3NotifyLambda);

    const eventbus = new CfnEventBus(this, "CloudformationEventBus", {
      name: "CloudformationEventBus",
    });

    const eventBusPolicy = new CfnEventBusPolicy(this, "EventBusPolicy", {
      eventBusName: "CloudformationEventBus",
      statementId: "AllowPutEventsWithinOrganizationAccounts",
      action: "events:PutEvents",
      principal: "*",
      condition: {
        key: "aws:PrincipalOrgID",
        type: "StringEquals",
        value: props.orgId,
      },
    });
    eventBusPolicy.addDependsOn(eventbus);
    const cloudFormationEventHandler = new NodejsFunction(
      this,
      "DeploymentProgressHandler",
      {
        entry: path.join(
          __dirname,
          "../src/control-plane/lambdas/deployment-progress.handler.ts"
        ),
        runtime: Runtime.NODEJS_18_X,
        memorySize: 512,
        timeout: Duration.seconds(60),
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grantReadWriteData(cloudFormationEventHandler);
    const cloudformationEventBus = EventBus.fromEventBusName(
      this,
      "CloudformationEventBusRef",
      "CloudformationEventBus"
    );
    new Rule(this, "CloudformationAggregatorRule", {
      eventBus: cloudformationEventBus,
      eventPattern: {
        source: ["aws.cloudformation"],
      },
      targets: [new LambdaFunction(cloudFormationEventHandler)],
    });
  }
}
