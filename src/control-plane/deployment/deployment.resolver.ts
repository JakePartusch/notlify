import { customAlphabet } from "nanoid";
import { findApplicationByName } from "../application/application.service";
import {
  Deployment,
  InitiateDeploymentResponse,
  MutationInitiateDeploymentArgs,
  QueryDeploymentArgs,
  Status,
} from "../generated/graphql.types";
import {
  createDeploymentRecord,
  getDeploymentById,
  getPresignedDeploymentUrl,
} from "./deployment.service";

const CUSTOMER_ID = "JakePartusch";

export const queryDeploymentResolver = async (
  args: QueryDeploymentArgs
): Promise<Deployment> => {
  const { applicationId, deploymentId } = args;
  const deployment = await getDeploymentById(applicationId, deploymentId);
  if (!deployment) {
    throw new Error("Not found");
  }
  return deployment;
};

export const initiateDeploymentResolver = async (
  args: MutationInitiateDeploymentArgs
): Promise<InitiateDeploymentResponse> => {
  const nanoid = customAlphabet("1234567890abcdef");
  const deploymentId = nanoid();
  const customerId = CUSTOMER_ID; //TODO: get from auth context
  const application = await findApplicationByName(
    customerId,
    args.applicationName
  );
  if (!application) {
    throw new Error("Application not found");
  }
  const url = await getPresignedDeploymentUrl(application, deploymentId);
  const deployment: Deployment = {
    id: deploymentId,
    commitHash: args.commitHash,
    status: Status.PendingUpload,
  };
  await createDeploymentRecord(deployment, application.id);
  return {
    id: deploymentId,
    status: Status.PendingUpload,
    commitHash: args.commitHash,
    deploymentUploadLocation: url,
  };
};
