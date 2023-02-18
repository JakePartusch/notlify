#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DomainStack } from "../lib/domain.stack";

const app = new cdk.App();

new DomainStack(app, "NotlifyDomain", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
