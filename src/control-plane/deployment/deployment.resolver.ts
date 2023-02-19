import { customAlphabet } from "nanoid";
import { AppContext } from "../api";
import {
  findApplicationByName,
  getApplicationById,
} from "../application/application.service";
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

export const getDeploymentResolver = async (
  args: QueryGetDeploymentArgs,
  context: AppContext
): Promise<Deployment> => {
  const { input } = args;
  const { applicationId, deploymentId } = input;
  const application = await getApplicationById(applicationId);
  if (application.customerId !== context.identity.customerId) {
    throw new Error("Unauthorized");
  }
  const deployment = await getDeploymentById(applicationId, deploymentId);
  if (!deployment) {
    throw new Error("Not found");
  }
  return deployment;
};

export const listDeploymentsResolver = async (
  args: QueryListDeploymentsArgs,
  context: AppContext
): Promise<Deployment[]> => {
  const { input } = args;
  const { applicationId } = input;
  const application = await getApplicationById(applicationId);
  if (application.customerId !== context.identity.customerId) {
    throw new Error("Unauthorized");
  }
  return findAllDeploymentsByApplicationId(applicationId);
};

export const initiateDeploymentResolver = async (
  args: MutationInitiateDeploymentArgs,
  context: AppContext
): Promise<InitiateDeploymentResponse> => {
  const { input } = args;
  const { applicationName, commitHash } = input;
  const nanoid = customAlphabet("1234567890abcdef");
  const deploymentId = nanoid();
  const customerId = context.identity.customerId;
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
