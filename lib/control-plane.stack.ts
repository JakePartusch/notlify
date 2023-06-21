import { CfnOutput } from "aws-cdk-lib";
import { CfnEventBusPolicy } from "aws-cdk-lib/aws-events";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as sst from "sst/constructs";

interface ControlPlaneStackProps {
  gitHubToken: string;
  gitHubWorkflowUrl: string;
  dataPlaneAccounts: string[];
  orgId: string;
}

const { GH_TOKEN, GH_WORKFLOW_URL, DATA_PLANE_ACCOUNTS, ORG_ID } = process.env;

export function ControlPlaneStack(ctx: sst.StackContext) {
  const { stack } = ctx;

  const props: ControlPlaneStackProps = {
    gitHubToken: GH_TOKEN!,
    gitHubWorkflowUrl: GH_WORKFLOW_URL!,
    dataPlaneAccounts: DATA_PLANE_ACCOUNTS!.split(","),
    orgId: ORG_ID!,
  };

  const dataPlaneAssumePolicyStatements: PolicyStatement[] =
    props.dataPlaneAccounts.map(
      (account) =>
        new PolicyStatement({
          actions: ["sts:AssumeRole"],
          effect: Effect.ALLOW,
          resources: [`arn:aws:iam::${account}:role/*`],
        })
    );

  const table = new sst.Table(stack, "ControlPlaneTable", {
    fields: {
      PK: "string",
      SK: "string",
      GSI1PK: "string",
      GSI1SK: "string",
    },
    primaryIndex: { partitionKey: "PK", sortKey: "SK" },
    globalIndexes: {
      GSI1: { partitionKey: "GSI1PK", sortKey: "GSI1SK" },
    },
  });

  const sourceFilesBucket = new sst.Bucket(stack, "SourceFilesBucket", {});

  sourceFilesBucket.addNotifications(stack, {
    deploymetnInitiated: {
      function: {
        handler:
          "src/control-plane/lambdas/deployment-initiated.handler.handler",
        permissions: [sourceFilesBucket, table],
        environment: {
          TABLE_NAME: table.tableName,
          SOURCE_FILES_BUCKET_NAME: sourceFilesBucket.bucketName,
          GITHUB_TOKEN: props.gitHubToken,
          GITHUB_WORKFLOW_URL: props.gitHubWorkflowUrl,
        },
      },
      events: ["object_created"],
    },
  });

  const api = new sst.Api(stack, "Api", {
    cors: {
      allowHeaders: ["*"],
      allowMethods: ["ANY"],
      allowOrigins: ["*"],
      maxAge: "600 seconds",
    },
    routes: {
      "ANY /api": {
        function: {
          handler: "src/control-plane/api.handler",
          timeout: 30,
          permissions: [
            sourceFilesBucket,
            table,
            ...dataPlaneAssumePolicyStatements,
          ],
          environment: {
            TABLE_NAME: table.tableName,
            SOURCE_FILES_BUCKET_NAME: sourceFilesBucket.bucketName,
            GITHUB_TOKEN: props.gitHubToken,
            GITHUB_WORKFLOW_URL: props.gitHubWorkflowUrl,
          },
        },
      },
    },
  });

  new CfnOutput(stack, `API Gateway`, {
    value: `${api.url}/api`,
  });

  new sst.EventBus(stack, "SstCloudformationEventBus", {
    cdk: {
      eventBus: {
        eventBusName: `CloudformationEventBus-${stack.stage}`,
      },
    },
    rules: {
      cloudformationRule: {
        pattern: { source: ["aws.cloudformation"] },
        targets: {
          deploymentProgressHandler: {
            function: {
              handler:
                "src/control-plane/lambdas/deployment-progress.handler.handler",
              environment: {
                TABLE_NAME: table.tableName,
              },
              timeout: 60,
              permissions: [table, ...dataPlaneAssumePolicyStatements],
            },
          },
        },
      },
    },
  });

  new CfnEventBusPolicy(stack, "EventBusPolicy", {
    eventBusName: `CloudformationEventBus-${stack.stage}`,
    statementId: `AllowPutEventsWithinOrganizationAccounts-${stack.stage}`,
    action: "events:PutEvents",
    principal: "*",
    condition: {
      key: "aws:PrincipalOrgID",
      type: "StringEquals",
      value: props.orgId,
    },
  });
}
