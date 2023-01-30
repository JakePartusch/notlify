#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ControlPlaneStack } from "../lib/control-plane.stack";
import * as dotenv from "dotenv";
dotenv.config();

const app = new cdk.App();

const { GH_TOKEN, GH_WORKFLOW_URL, DATA_PLANE_ACCOUNTS, ORG_ID } = process.env;

if (!GH_TOKEN || !GH_WORKFLOW_URL || !DATA_PLANE_ACCOUNTS || !ORG_ID) {
  throw new Error("Missing required environment variables");
}

new ControlPlaneStack(app, `ControlPlane`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
  gitHubToken: GH_TOKEN,
  gitHubWorkflowUrl: GH_WORKFLOW_URL,
  dataPlaneAccounts: DATA_PLANE_ACCOUNTS.split(","),
  orgId: ORG_ID,
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
