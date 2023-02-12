import { customAlphabet } from "nanoid";
import {
  Application,
  ApplicationStatus,
  MutationCreateApplicationArgs,
  QueryGetApplicationArgs,
} from "../generated/graphql.types";
import {
  createApplicationRecord,
  findAllApplicationsByCustomerId,
  findApplicationByName,
  getApplicationById,
  triggerDataPlaneUpdate,
} from "./application.service";
import { InternalApplication } from "./application.types";

const CUSTOMER_ID = "JakePartusch";
const DATA_PLANE_ACCOUNTS = ["837992707202"];

export const getApplicationResolver = async (
  args: QueryGetApplicationArgs
): Promise<Application> => {
  const { input } = args;
  const { id, name } = input;
  const customerId = CUSTOMER_ID;
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

export const listApplicationsResolver = async (): Promise<Application[]> => {
  const customerId = CUSTOMER_ID;
  return findAllApplicationsByCustomerId(customerId);
};

export const createApplicationResolver = async (
  args: MutationCreateApplicationArgs
): Promise<Application> => {
  const { input } = args;
  const { name, ...rest } = input;
  const status = ApplicationStatus.CreateRequested;
  const nanoid = customAlphabet("1234567890abcdef");
  const id = nanoid();
  const customerId = CUSTOMER_ID; //TOOD: get from auth context
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
  await triggerDataPlaneUpdate(application);
  return {
    customerId,
    id,
    name,
    status,
    ...rest,
  };
};
