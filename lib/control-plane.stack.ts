import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as cdk from "aws-cdk-lib";
import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { BlockPublicAccess, Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from "constructs";
import * as path from "path";

export class ControlPlaneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
        GITHUB_TOKEN: "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",
        GITHUB_WORKFLOW_URL:
          "https://api.github.com/repos/JakePartusch/paas-app/actions/workflows/data-plane-deploy.yml/dispatches",
      },
    });

    const httpApi = new HttpApi(this, "HttpApi");
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

    const s3NotifyLambda = new NodejsFunction(
      this,
      "SourceFilesUpdatedHandler",
      {
        entry: path.join(
          __dirname,
          "../src/control-plane/source-files-updated-handler.ts"
        ),
        runtime: Runtime.NODEJS_18_X,
        memorySize: 512,
        timeout: Duration.seconds(30),
        environment: {
          TABLE_NAME: table.tableName,
          SOURCE_FILES_BUCKET_NAME: sourceFilesBucket.bucketName,
          GITHUB_TOKEN: "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",
          GITHUB_WORKFLOW_URL:
            "https://api.github.com/repos/JakePartusch/paas-app/actions/workflows/data-plane-deploy.yml/dispatches",
        },
      }
    );

    sourceFilesBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(s3NotifyLambda)
    );

    sourceFilesBucket.grantWrite(lambda);
    table.grantReadWriteData(lambda);
    table.grantReadWriteData(s3NotifyLambda);
  }
}
