import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda"; //highlight-line
import {
  Application,
  Deployment,
  Resolvers,
  Status,
} from "./generated/graphql.types";
import { typeDefs } from "./schema";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers"; // ES6 import
import { customAlphabet } from "nanoid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocument.from(ddbClient);

interface InternalApplication extends Application {
  awsAccountId: string;
}

// const DATA_PLANE_ACCOUNTS = ["857786057494", "837992707202"];
const DATA_PLANE_ACCOUNTS = ["837992707202"];

const findApplicationByName = async (
  customerId: string,
  applicationName: string
): Promise<InternalApplication | undefined> => {
  const response = await ddbDocClient.query({
    TableName: process.env.TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :gsi1pk",
    ExpressionAttributeValues: {
      ":gsi1pk": `CUSTOMER#${customerId}`,
    },
  });
  const items: InternalApplication[] | undefined = response.Items as
    | InternalApplication[]
    | undefined;
  return items?.find((item) => item.name === applicationName);
};

const createApplicationRecord = async (application: InternalApplication) => {
  await ddbDocClient.put({
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: `APPLICATION#${application.id}`,
      SK: `APPLICATION#${application.id}`,
      GSI1PK: `CUSTOMER#${application.customerId}`,
      GSI1SK: `APPLICATION#${application.id}`,
      type: "APPLICATION",
      ...application,
    },
  });
};

const createDeploymentRecord = async (
  deployment: Deployment,
  applicationId: string
) => {
  ddbDocClient.put({
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: `APPLICATION#${applicationId}`,
      SK: `DEPLOYMENT#${deployment.id}`,
      type: "DEPLOYMENT",
      ...deployment,
    },
  });
};

const triggerDataPlaneDeployment = async (application: InternalApplication) => {
  //@ts-ignore
  await fetch(
    `https://api.github.com/repos/JakePartusch/paas-app/actions/workflows/data-plane-deploy.yml/dispatches`,
    {
      method: "POST",
      body: JSON.stringify({
        ref: "main",
        inputs: {
          customerId: application.customerId,
          applicationId: application.id,
          awsAccountId: application.awsAccountId,
          region: application.region.replaceAll("_", "-").toLowerCase(),
        },
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );
};

const getPresignedDeploymentUrl = async (
  application: InternalApplication,
  deploymentId: string
) => {
  const credentials = fromTemporaryCredentials({
    params: {
      RoleArn: `arn:aws:iam::${application.awsAccountId}:role/CrossAccountRole-${application.customerId}-${application.id}`,
    },
  });
  const s3Client = new S3Client({
    credentials,
    region: application.region.toLowerCase().split("_").join("-"),
  });

  const putObjectCommand = new PutObjectCommand({
    Bucket:
      `sourcefilesbucket-${application.customerId}-${application.id}`.toLowerCase(),
    Key: `${application.customerId}-${application.id}-${deploymentId}.zip`,
  });
  return await getSignedUrl(s3Client, putObjectCommand, {
    expiresIn: 3600,
    signingRegion: application.region.toLowerCase().split("_").join("-"),
  });
};

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
      await triggerDataPlaneDeployment(application);
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
