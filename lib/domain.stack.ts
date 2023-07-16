import * as sst from "sst/constructs";
import { Domain } from "./domain.construct";

const { DOMAIN } = process.env;

export function DomainStack(ctx: sst.StackContext) {
  const { stack, app } = ctx;

  if (app.stage === "prod") {
    new Domain(stack, "NotlifyDomain", {
      domainName: DOMAIN!,
    });
  }
}
