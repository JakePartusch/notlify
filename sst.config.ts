import { SSTConfig } from "sst";
import { ControlPlaneStack } from "./lib/control-plane.stack";

export default {
  config(_input) {
    return {
      name: "NotlifyControlPlane",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(ControlPlaneStack);
  },
} satisfies SSTConfig;
