import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import { Resolvers } from "./generated/graphql.types";
import { typeDefs } from "./schema";
import {
  createApplicationResolver,
  getApplicationResolver,
  listApplicationsResolver,
} from "./application/application.resolver";
import {
  initiateDeploymentResolver,
  getDeploymentResolver,
  listDeploymentsResolver,
} from "./deployment/deployment.resolver";

const resolvers: Resolvers = {
  Query: {
    listApplications: async (_, args) => {
      return listApplicationsResolver();
    },
    getApplication: async (_, args) => {
      return getApplicationResolver(args);
    },
    listDeployments: async (_, args) => {
      return listDeploymentsResolver(args);
    },
    getDeployment: async (_, args) => {
      return getDeploymentResolver(args);
    },
  },
  Mutation: {
    createApplication: async (_, args) => {
      return createApplicationResolver(args);
    },
    initiateDeployment: async (_, args) => {
      return initiateDeploymentResolver(args);
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
