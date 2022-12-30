import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as cdk from "aws-cdk-lib";
import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
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
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const lambda = new NodejsFunction(this, "ControlPlaneApiHandler", {
      entry: path.join(__dirname, "../src/control-plane/api.ts"),
      runtime: Runtime.NODEJS_18_X,
      memorySize: 512,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(lambda);

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
  }
}
