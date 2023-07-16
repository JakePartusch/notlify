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
  APIGatewayProxyCallbackV2,
  APIGatewayProxyEventV2,
  Context,
} from "aws-lambda";
import jwt from "jsonwebtoken";
import { getApiKeyRecord } from "./application/application.service";
import { ApiHandler } from "sst/node/api";
import { Config } from "sst/node/config";
import { trace } from "@opentelemetry/api";

export interface AppContext {
  identity: {
    customerId: string;
  };
}

const resolvers: Resolvers = {
  Query: {
    listApplications: async (_, args, context) => {
      return listApplicationsResolver(context);
    },
    getApplication: async (_, args, context) => {
      return getApplicationResolver(args, context);
    },
    listDeployments: async (_, args, context) => {
      return listDeploymentsResolver(args, context);
    },
    getDeployment: async (_, args, context) => {
      return getDeploymentResolver(args, context);
    },
  },
  Mutation: {
    createApplication: async (_, args, context) => {
      return createApplicationResolver(args, context);
    },
    initiateDeployment: async (_, args, context) => {
      return initiateDeploymentResolver(args, context);
    },
    deleteApplication: async (_, args, context) => {
      return deleteApplicationResolver(args, context);
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

const apolloContext = async ({
  event,
}: {
  event: APIGatewayProxyEventV2;
}): Promise<AppContext> => {
  console.log(JSON.stringify(event, null, 2));
  const authorizationHeader = event.headers["authorization"];
  if (authorizationHeader?.startsWith("Bearer")) {
    return new Promise((resolve, reject) => {
      const token = authorizationHeader?.split(" ").at(1);
      if (!token) {
        throw new Error("Unauthorized");
      }
      const publicKey = Config.JWT_PUBLIC_KEY;
      console.log(publicKey);

      jwt.verify(token, publicKey, {}, function (err, decoded: any) {
        console.log(JSON.stringify(decoded));
        resolve({
          identity: {
            customerId: decoded.login,
          },
        });
      });
    });
  } else if (authorizationHeader?.startsWith("APIKEY")) {
    const key = authorizationHeader?.split(" ").at(1);
    if (!key) {
      throw new Error("Unauthorized");
    }
    const apikeyRecord = await getApiKeyRecord(key);
    if (!apikeyRecord) {
      throw new Error("Unauthorized");
    }
    return {
      identity: {
        customerId: apikeyRecord.customerId,
      },
    };
  }
  throw new Error("Unauthorized");
};

export const handler = ApiHandler(
  //@ts-ignore
  async (
    event: APIGatewayProxyEventV2,
    context: Context,
    callback: APIGatewayProxyCallbackV2
  ) => {
    const tracer = trace
      .getTracer(process.env.OTEL_SERVICE_NAME!)
      .startSpan("api-handler", { root: false });
    if (event.requestContext.http.method === "OPTIONS") {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    }
    //@ts-ignore
    const apolloHandler = startServerAndCreateLambdaHandler(server, {
      context: apolloContext,
    });
    const resp = await apolloHandler(event, context, callback);
    if (tracer) {
      tracer.end();
    }
    return {
      ...resp,
      headers: {
        ...resp?.headers,
        "Access-Control-Allow-Origin": "*",
      },
    };
  }
);
