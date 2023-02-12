import * as cdk from "aws-cdk-lib";
import {
  ManagedPolicy,
  OpenIdConnectProvider,
  Role,
  WebIdentityPrincipal,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class OidcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const provider = new OpenIdConnectProvider(this, "GitHubProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
      thumbprints: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
    });

    const deploymentRole = new Role(this, "GitHubDeploymentRole", {
      roleName: "GitHubDeployer",
      assumedBy: new WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringLike: {
          // Only allow specified subjects to assume this role
          [`token.actions.githubusercontent.com:sub`]:
            "repo:JakePartusch/notlify:ref:refs/heads/main",
        },
        StringEquals: {
          // Audience is always sts.amazonaws.com with AWS official Github Action
          // https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#adding-the-identity-provider-to-aws
          [`token.actions.githubusercontent.com:aud`]: "sts.amazonaws.com",
        },
      }),
    });

    deploymentRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
    );
  }
}
