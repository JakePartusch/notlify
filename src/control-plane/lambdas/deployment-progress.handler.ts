import { EventBridgeEvent } from "aws-lambda";
import { parse } from "@aws-sdk/util-arn-parser";
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import {
  findInitiatedDeploymentsByApplicationId,
  updateDeploymentToComplete,
} from "../deployment/deployment.service";
import {
  getApplicationById,
  updateApplicationDeployment,
} from "../application/application.service";
import {
  getDataPlaneCrossAccountRoleArn,
  getRegionStringFromGraphqlRegion,
} from "../common/aws/utils";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers";

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
      const application = await getApplicationById(appId);
      const credentials = fromTemporaryCredentials({
        params: {
          RoleArn: getDataPlaneCrossAccountRoleArn(
            application.awsAccountId,
            application.customerId,
            application.id
          ),
        },
      });
      const region = getRegionStringFromGraphqlRegion(application.region);

      const client = new CloudFormationClient({
        region,
        credentials,
      });
      const command = new DescribeStacksCommand({
        StackName: stackName,
      });
      const response = await client.send(command);
      const outputs = response?.Stacks?.[0]?.Outputs;
      const deploymentUrl = outputs?.find((output) => {
        return output.OutputKey?.startsWith("DataPlaneBaseUrl");
      });
      if (!deploymentUrl) {
        throw new Error("Unable to parse stack for deployment url");
      }
      const initiatedDeployments =
        await findInitiatedDeploymentsByApplicationId(appId);
      if (initiatedDeployments.length) {
        //TODO: wrap in transaction?
        await updateApplicationDeployment(
          appId,
          application.status,
          deploymentUrl.OutputValue!
        );
        await updateDeploymentToComplete(
          appId,
          initiatedDeployments[0].id, //TODO: how to handle more than one?
          deploymentUrl.OutputValue!
        );
      }
    }
  }
};
