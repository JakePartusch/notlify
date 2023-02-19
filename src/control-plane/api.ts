import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import { Resolvers } from "./generated/graphql.types";
import { typeDefs } from "./schema";
import {
  createApplicationResolver,
  deleteApplicationResolver,
  getApplicationResolver,
  listApplicationsResolver,
} from "./application/application.resolver";
import {
  initiateDeploymentResolver,
  getDeploymentResolver,
  listDeploymentsResolver,
} from "./deployment/deployment.resolver";
import {
  APIGatewayEvent,
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context,
} from "aws-lambda";
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";

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
    deleteApplication: async (_, args) => {
      return deleteApplicationResolver(args);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  includeStacktraceInErrorResponses: true,
  csrfPrevention: false,
});

//@ts-ignore
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => {
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  }
  //@ts-ignore
  const apolloHandler = startServerAndCreateLambdaHandler(server, {
    context: async ({ event: APIGatewayProxyEvent, context }) => {
      return new Promise((resolve, reject) => {
        const authorizationHeader = event.headers["Authorization"];
        const token = authorizationHeader?.split(" ").at(1);
        if (!token) {
          throw new Error("Unauthorized");
        }
        const client = jwksClient({
          jwksUri: "https://dev-6pd0gm26.auth0.com/.well-known/jwks.json",
        });
        function getKey(header: any, callback: any) {
          client.getSigningKey(header.kid, function (err, key) {
            const signingKey = key?.publicKey || key?.rsaPublicKey;
            callback(null, signingKey);
          });
        }

        jwt.verify(token, getKey, {}, function (err, decoded: any) {
          console.log(JSON.stringify(decoded));
          resolve(decoded);
        });
      });
    },
  });
  const resp = await apolloHandler(event, context, callback);
  return {
    ...resp,
    headers: {
      ...resp?.headers,
      "Access-Control-Allow-Origin": "*",
    },
  };
};
