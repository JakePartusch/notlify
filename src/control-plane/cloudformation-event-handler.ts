import { EventBridgeEvent } from "aws-lambda";
import { parse } from "@aws-sdk/util-arn-parser";
import {
  findInitiatedDeploymentsByApplicationId,
  updateDeploymentStatus,
} from "./deployment/deployment.service";
import { Status } from "./generated/graphql.types";

interface CloudformationDetail {
  "stack-id": string;
  "logical-resource-id"?: string;
  "physical-resource-id"?: string;
  "status-details": {
    status: string;
    "status-reason": string;
  };
  "resource-type"?: string;
  "client-request-token": string;
}
export const handler = async (
  event: EventBridgeEvent<
    "CloudFormation Resource Status Change",
    CloudformationDetail
  >
) => {
  if (
    !event.detail["logical-resource-id"] &&
    event.detail?.["status-details"]?.status === "UPDATE_COMPLETE"
  ) {
    console.log(JSON.stringify(event, null, 2));
    const { resource } = parse(event.detail["stack-id"]);
    const stackName = resource.split("/").at(1);
    if (stackName) {
      const [_, customerId, appId] = stackName.split("-");
      const initiatedDeployments =
        await findInitiatedDeploymentsByApplicationId(appId);
      if (initiatedDeployments.length) {
        await updateDeploymentStatus(
          appId,
          initiatedDeployments[0].id, //TODO: how to handle more than one?
          Status.Complete
        );
      }
    }
  }
};
