#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DataPlaneStack } from "../lib/data-plane.stack";
import { Domain } from "../lib/data-plane.construct";

const app = new cdk.App();

const customerId = app.node.tryGetContext("customerId");
const applicationId = app.node.tryGetContext("applicationId");
const sourceFilesZipName = app.node.tryGetContext("sourceFilesZipName");
const domainConfigAsString = app.node.tryGetContext("domainConfig");
let domainConfig: Domain | undefined;
if (domainConfigAsString) {
  domainConfig = JSON.parse(domainConfigAsString);
}

new DataPlaneStack(app, `DataPlaneStack-${customerId}-${applicationId}`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  sourceFilesZipName,
  customerId,
  applicationId,
  domain: domainConfig,

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
