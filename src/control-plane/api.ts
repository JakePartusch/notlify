import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda"; //highlight-line
import { Resolvers } from "./generated/graphql.types";
import { typeDefs } from "./schema";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
import { nanoid } from "nanoid";

const resolvers: Resolvers = {
  Query: {
    hello: () => "world",
  },
  Mutation: {
    createApplication: async (parent, args, contextValue, info) => {
      const id = nanoid();
      const customerId = "JakePartusch";
      const command = new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: { S: `APPLICATION#${id}` },
          SK: { S: `CUSTOMER#${customerId}` },
          customerId: { S: customerId },
          name: { S: args.name },
          region: { S: args.region },
        },
      });
      try {
        await client.send(command);
        return {
          customerId,
          id,
          name: args.name,
          region: args.region,
        };
      } catch (e) {
        console.error("Unable to create application", e);
        throw e;
      }
    },
    initiateDeployment: async (parent, args, contextValue, info) => {
      const deploymentId = nanoid();
      //TODO: Assume a role in the data plane account
      //TODO: Return a temporary url for the s3 upload
      //TODO: Store the deployment record
      return;
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
