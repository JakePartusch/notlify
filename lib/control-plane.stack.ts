import { CfnEventBusPolicy } from "aws-cdk-lib/aws-events";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import * as sst from "sst/constructs";
import { FunctionProps } from "sst/constructs";

interface ControlPlaneStackProps {
  gitHubToken: string;
  gitHubWorkflowUrl: string;
  dataPlaneAccounts: string[];
  orgId: string;
  domain: string;
}

const {
  GH_TOKEN,
  GH_WORKFLOW_URL,
  DATA_PLANE_ACCOUNTS,
  ORG_ID,
  DOMAIN,
  HONEYCOMB_KEY,
} = process.env;

export function ControlPlaneStack(ctx: sst.StackContext) {
  const { stack, app } = ctx;
  const { stage } = app;

  const otelLayer = LayerVersion.fromLayerVersionArn(
    stack,
    "OtelLayer",
    "arn:aws:lambda:us-east-1:901920570463:layer:aws-otel-nodejs-arm64-ver-1-13-0:2"
  );

  const defaultTracingProps = (): FunctionProps => ({
    layers: [otelLayer],
    tracing: "pass_through",
    copyFiles: [{ from: "src/control-plane/common/collector.yaml" }],
    architecture: "arm_64",
    runtime: "nodejs18.x",
    nodejs: {
      esbuild: {
        external: [
          "@opentelemetry/api",
          "@opentelemetry/sdk-node",
          "@opentelemetry/auto-instrumentations-node",
          "@aws-sdk/client-dynamodb",
          "@aws-sdk/client-s3",
          "@aws-sdk/client-sts",
          "@aws-sdk/client-cloudformation",
        ],
      },
    },
  });

  const getDefaultTracingEnv = () => ({
    OTEL_EXPORTER_OTLP_ENDPOINT: `https://api.honeycomb.io`,
    OTEL_EXPORTER_OTLP_HEADERS: `x-honeycomb-team=${HONEYCOMB_KEY}`,
    OTEL_PROPAGATORS: `tracecontext`,
    AWS_LAMBDA_EXEC_WRAPPER: `/opt/otel-handler`,
    OPENTELEMETRY_COLLECTOR_CONFIG_FILE: `/var/task/src/control-plane/common/collector.yaml`,
    OTEL_TRACES_SAMPLER: "always_on",
  });

  const props: ControlPlaneStackProps = {
    gitHubToken: GH_TOKEN!,
    gitHubWorkflowUrl: GH_WORKFLOW_URL!,
    dataPlaneAccounts: DATA_PLANE_ACCOUNTS!.split(","),
    orgId: ORG_ID!,
    domain: DOMAIN!,
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
        handler: "src/control-plane/lambdas/deployment-initiated.handler",
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
          ...getDefaultTracingEnv(),
          OTEL_SERVICE_NAME: `deployment-initiated-${stage}`,
        },
        ...defaultTracingProps(),
      },
      events: ["object_created"],
    },
  });

  const JWT_SECRET_KEY = new sst.Config.Secret(stack, "JWT_SECRET_KEY");
  const JWT_PUBLIC_KEY = new sst.Config.Secret(stack, "JWT_PUBLIC_KEY");
  const GITHUB_OAUTH_SECRET = new sst.Config.Secret(
    stack,
    "GITHUB_OAUTH_SECRET"
  );

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
          bind: [JWT_PUBLIC_KEY],
          environment: {
            TABLE_NAME: table.tableName,
            SOURCE_FILES_BUCKET_NAME: sourceFilesBucket.bucketName,
            GITHUB_TOKEN: props.gitHubToken,
            GITHUB_WORKFLOW_URL: props.gitHubWorkflowUrl,
            ...getDefaultTracingEnv(),
            OTEL_SERVICE_NAME: `control-plane-${stage}`,
          },
          ...defaultTracingProps(),
        },
      },
      "ANY /github/callback": {
        function: {
          handler: "src/control-plane/auth.handler",
          bind: [JWT_SECRET_KEY, GITHUB_OAUTH_SECRET],
          timeout: 30,
          environment: {
            ...getDefaultTracingEnv(),
            OTEL_SERVICE_NAME: `auth-${stage}`,
          },
          ...defaultTracingProps(),
        },
      },
    },
  });

  const site = new sst.StaticSite(stack, "web", {
    path: "src/control-plane/ui/app",
    buildOutput: "public",
    buildCommand: "npm run build",
    errorPage: "404.html",
    environment: {
      API_URL: api.url,
    },
    customDomain: {
      domainName:
        app.stage === "prod" ? props.domain : `${app.stage}.${props.domain}`,
      domainAlias: app.stage === "prod" ? `www.${props.domain}` : undefined,
      isExternalDomain: false,
    },
  });

  const eventBus = new sst.EventBus(stack, "SstCloudformationEventBus", {
    rules: {
      cloudformationRule: {
        pattern: { source: ["aws.cloudformation"] },
        targets: {
          deploymentProgressHandler: {
            function: {
              handler: "src/control-plane/lambdas/deployment-progress.handler",
              environment: {
                TABLE_NAME: table.tableName,
                ...getDefaultTracingEnv(),
                OTEL_SERVICE_NAME: `deployment-progress-${stage}`,
              },
              timeout: 60,
              permissions: [table, ...dataPlaneAssumePolicyStatements],
              ...defaultTracingProps(),
            },
          },
        },
      },
    },
  });

  new CfnEventBusPolicy(stack, "EventBusPolicy", {
    eventBusName: eventBus.eventBusName,
    statementId: `AllowPutEventsWithinOrganizationAccounts-${stack.stage}`,
    action: "events:PutEvents",
    principal: "*",
    condition: {
      key: "aws:PrincipalOrgID",
      type: "StringEquals",
      value: props.orgId,
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    SiteURL: site.url,
  });
}
