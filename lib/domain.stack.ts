import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Domain } from "./domain.construct";

export class DomainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Domain(this, "NotlifyDomain", {
      domainName: "notlify.dev",
    });
  }
}
