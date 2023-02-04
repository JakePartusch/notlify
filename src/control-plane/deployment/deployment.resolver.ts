import { customAlphabet } from "nanoid";
import { findApplicationByName } from "../application/application.service";
import {
  Deployment,
  InitiateDeploymentResponse,
  MutationInitiateDeploymentArgs,
  QueryGetDeploymentArgs,
  QueryListDeploymentsArgs,
  Status,
} from "../generated/graphql.types";
import {
  createDeploymentRecord,
  findAllDeploymentsByApplicationId,
  getDeploymentById,
  getPresignedDeploymentUrl,
} from "./deployment.service";

const CUSTOMER_ID = "JakePartusch";

export const getDeploymentResolver = async (
  args: QueryGetDeploymentArgs
): Promise<Deployment> => {
  const { input } = args;
  const { applicationId, deploymentId } = input;
  const deployment = await getDeploymentById(applicationId, deploymentId);
  if (!deployment) {
    throw new Error("Not found");
  }
  return deployment;
};

export const listDeploymentsResolver = async (
  args: QueryListDeploymentsArgs
): Promise<Deployment[]> => {
  const { input } = args;
  const { applicationId } = input;
  return findAllDeploymentsByApplicationId(applicationId);
};

export const initiateDeploymentResolver = async (
  args: MutationInitiateDeploymentArgs
): Promise<InitiateDeploymentResponse> => {
  const { input } = args;
  const { applicationName, commitHash } = input;
  const nanoid = customAlphabet("1234567890abcdef");
  const deploymentId = nanoid();
  const customerId = CUSTOMER_ID; //TODO: get from auth context
  const application = await findApplicationByName(customerId, applicationName);
  if (!application) {
    throw new Error("Application not found");
  }
  const url = await getPresignedDeploymentUrl(application, deploymentId);
  const deployment: Deployment = {
    id: deploymentId,
    commitHash: commitHash,
    status: Status.PendingUpload,
  };
  await createDeploymentRecord(deployment, application.id);
  return {
    id: deploymentId,
    status: Status.PendingUpload,
    commitHash,
    deploymentUploadLocation: url,
  };
};
