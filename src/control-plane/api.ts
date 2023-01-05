import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import { Deployment, Resolvers, Status } from "./generated/graphql.types";
import { typeDefs } from "./schema";
import { customAlphabet } from "nanoid";
import {
  createApplicationRecord,
  findApplicationByName,
  triggerDataPlaneUpdate,
} from "./application/application.service";
import {
  createDeploymentRecord,
  getPresignedDeploymentUrl,
} from "./deployment/deployment.service";

const DATA_PLANE_ACCOUNTS = ["857786057494", "837992707202"];

const resolvers: Resolvers = {
  Query: {
    hello: () => "world",
  },
  Mutation: {
    createApplication: async (parent, args, contextValue, info) => {
      const nanoid = customAlphabet("1234567890abcdef");
      const id = nanoid();
      const customerId = "JakePartusch"; //TOOD: get from auth context
      const randomAwsAccount =
        DATA_PLANE_ACCOUNTS[
          Math.floor(Math.random() * DATA_PLANE_ACCOUNTS.length)
        ];
      const application = {
        id,
        customerId,
        name: args.name,
        region: args.region,
        awsAccountId: randomAwsAccount,
      };
      await createApplicationRecord(application);
      await triggerDataPlaneUpdate(application);
      return {
        customerId,
        id,
        name: args.name,
        region: args.region,
      };
    },
    initiateDeployment: async (parent, args, contextValue, info) => {
      const nanoid = customAlphabet("1234567890abcdef");
      const deploymentId = nanoid();
      const customerId = "JakePartusch"; //TODO: get from auth context
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
        deploymentUploadLocation: url,
      };
      await createDeploymentRecord(deployment, application.id);
      return {
        id: deploymentId,
        status: Status.PendingUpload,
        commitHash: args.commitHash,
        deploymentUploadLocation: url,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  includeStacktraceInErrorResponses: true,
});

//@ts-ignore
export const handler = startServerAndCreateLambdaHandler(server);
