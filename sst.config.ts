import { SSTConfig } from "sst";
import { ControlPlaneStack } from "./lib/control-plane.stack";
import { DomainStack } from "./lib/domain.stack";
import { OidcStack } from "./lib/oidc.stack";

export default {
  config(_input) {
    return {
      name: "Notlify",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(OidcStack);
    app.stack(DomainStack);
    app.stack(ControlPlaneStack);
  },
} satisfies SSTConfig;
