import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import { Resolvers } from "./generated/graphql.types";
import { typeDefs } from "./schema";
// import { typeDefs as scalarTypeDefs } from "graphql-scalars";
// import { resolvers as scalarResolvers } from "graphql-scalars";
import {
  createApplicationResolver,
  queryApplicationResolver,
} from "./application/application.resolver";
import {
  initiateDeploymentResolver,
  queryDeploymentResolver,
} from "./deployment/deployment.resolver";

const resolvers: Resolvers = {
  Query: {
    application: async (_, args) => {
      return queryApplicationResolver(args);
    },
    deployment: async (_, args) => {
      return queryDeploymentResolver(args);
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
