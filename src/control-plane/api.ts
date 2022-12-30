import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda"; //highlight-line
import { AvailableRegions, Resolvers } from "./generated/graphql.types";
import { typeDefs } from "./schema";

const resolvers: Resolvers = {
  Query: {
    hello: () => "world",
  },
  Mutation: {
    createApplication: async (parent, args, contextValue, info) => {
      return Promise.resolve({
        customerId: "blah",
        id: "123",
        name: "test-app",
        region: AvailableRegions.UsEast_1,
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  includeStacktraceInErrorResponses: true,
});

// This final export is important!
export const handler = startServerAndCreateLambdaHandler(server); //highlight-line
