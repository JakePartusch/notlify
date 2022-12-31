import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda"; //highlight-line
import { Resolvers } from "./generated/graphql.types";
import { typeDefs } from "./schema";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { nanoid } from "nanoid";
const stsClient = new STSClient({ region: "REGION" });
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const DATA_PLANE_ACCOUNTS = ["857786057494", "837992707202"];

const resolvers: Resolvers = {
  Query: {
    hello: () => "world",
  },
  Mutation: {
    createApplication: async (parent, args, contextValue, info) => {
      const id = nanoid();
      const customerId = "JakePartusch";
      const randomAwsAccount =
        DATA_PLANE_ACCOUNTS[
          Math.floor(Math.random() * DATA_PLANE_ACCOUNTS.length)
        ];
      const command = new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: { S: `APPLICATION#${id}` },
          SK: { S: `CUSTOMER#${customerId}` },
          customerId: { S: customerId },
          name: { S: args.name },
          region: { S: args.region },
          awsAccountId: { S: randomAwsAccount },
        },
      });
      try {
        await ddbClient.send(command);
        //TODO: trigger deployment to data plane account
        await fetch(
          `https://api.github.com/repos/JakePartusch/paas-app/actions/workflows/data-plane-deploy.yml/dispatches`,
          {
            method: "POST",
            body: JSON.stringify({
              ref: "main",
              inputs: {
                customerId,
                applicationId: id,
                region: args.region.replaceAll("_", "-").toLowerCase(),
              },
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
          }
        );
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
      //TODO: fetch application record from db
      //TODO: fetch Cloudformation template from Account
      await stsClient.send(
        new AssumeRoleCommand({
          RoleArn: `arn:aws:iam::837992707202:role/OrganizationAccountAccessRole`,
          RoleSessionName: "",
        })
      );
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
