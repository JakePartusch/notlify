import { customAlphabet } from "nanoid";
import { AppContext } from "../api";
import {
  Application,
  ApplicationStatus,
  DeleteApplicationResponse,
  MutationCreateApplicationArgs,
  MutationDeleteApplicationArgs,
  QueryGetApplicationArgs,
} from "../generated/graphql.types";
import {
  createApiKeyRecord,
  createApplicationRecord,
  deleteApplication,
  findAllApplicationsByCustomerId,
  findApplicationByName,
  getApplicationById,
  triggerDataPlaneUpdate,
} from "./application.service";
import { InternalApplication } from "./application.types";

const DATA_PLANE_ACCOUNTS = ["837992707202"];

export const getApplicationResolver = async (
  args: QueryGetApplicationArgs,
  context: AppContext
): Promise<Application> => {
  const { input } = args;
  const { id, name } = input;
  const customerId = context.identity.customerId;
  if (id) {
    const application = await getApplicationById(id);
    if (!application) {
      throw new Error("Not found");
    }
    return application;
  } else if (name) {
    const application = await findApplicationByName(customerId, name);
    if (!application) {
      throw new Error("Not found");
    }
    return application;
  }
  throw new Error("Invalid input");
};

export const listApplicationsResolver = async (
  context: AppContext
): Promise<Application[]> => {
  const customerId = context.identity.customerId;
  return findAllApplicationsByCustomerId(customerId);
};

export const createApplicationResolver = async (
  args: MutationCreateApplicationArgs,
  context: AppContext
): Promise<Application> => {
  const { input } = args;
  const { name, ...rest } = input;
  const status = ApplicationStatus.CreateRequested;
  const nanoid = customAlphabet("1234567890abcdef");
  const id = nanoid();
  const customerId = context.identity.customerId;
  const existingApplication = await findApplicationByName(customerId, name);
  if (existingApplication) {
    throw new Error("An application with this name already exists");
  }
  const randomAwsAccount =
    DATA_PLANE_ACCOUNTS[Math.floor(Math.random() * DATA_PLANE_ACCOUNTS.length)];
  const application: InternalApplication = {
    id,
    customerId,
    name,
    status,
    ...rest,
    awsAccountId: randomAwsAccount,
  };
  await createApplicationRecord(application);
  const apiKey = await createApiKeyRecord(application.id, customerId);
  await triggerDataPlaneUpdate(application);
  return {
    customerId,
    id,
    name,
    status,
    apiKey,
    ...rest,
  };
};

export const deleteApplicationResolver = async (
  args: MutationDeleteApplicationArgs,
  context: AppContext
): Promise<DeleteApplicationResponse> => {
  const { input } = args;
  const { id, name } = input;
  const customerId = context.identity.customerId;
  let application: InternalApplication | undefined;
  if (id) {
    application = await getApplicationById(id);
    if (!application) {
      throw new Error("Not found");
    }
  } else if (name) {
    application = await findApplicationByName(customerId, name);
    if (!application) {
      throw new Error("Not found");
    }
  }
  await deleteApplication(application?.id!);
  //TODO: Delete Deployment records and data plane stack
  return {
    message: "Successfully deleted.",
  };
};
