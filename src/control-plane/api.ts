import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda"; //highlight-line
import {
  Application,
  Deployment,
  Resolvers,
  Status,
} from "./generated/graphql.types";
import { typeDefs } from "./schema";
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers"; // ES6 import
import { nanoid } from "nanoid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

interface InternalApplication extends Application {
  awsAccountId: string;
}

// const DATA_PLANE_ACCOUNTS = ["857786057494", "837992707202"];
const DATA_PLANE_ACCOUNTS = ["837992707202"];

const findApplicationByName = async (
  customerId: string,
  applicationName: string
): Promise<InternalApplication | undefined> => {
  const queryCommand = new QueryCommand({
    TableName: process.env.TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :gsi1pk",
    ExpressionAttributeValues: {
      gsi1pk: { S: `CUSTOMER#${customerId}` },
    },
  });
  const response = await ddbClient.send(queryCommand);
  const items: InternalApplication[] | undefined = response.Items as
    | InternalApplication[]
    | undefined;
  return items?.find((item) => item.name === applicationName);
};

const createApplicationRecord = async (application: InternalApplication) => {
  const command = new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: { S: `APPLICATION#${application.id}` },
      SK: { S: `APPLICATION#${application.id}` },
      GSI1PK: { S: `CUSTOMER#${application.customerId}` },
      GSI1SK: { S: `APPLICATION#${application.id}` },
      type: { S: "APPLICATION" },
      customerId: { S: application.customerId },
      name: { S: application.name },
      region: { S: application.region },
      awsAccountId: { S: application.awsAccountId },
    },
  });
  await ddbClient.send(command);
};

const createDeploymentRecord = async (
  deployment: Deployment,
  applicationId: string
) => {
  const putItemCommand = new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: { S: `APPLICATION#${applicationId}` },
      SK: { S: `DEPLOYMENT#${deployment.id}` },
      type: { S: "APPLICATION" },
      deploymentId: { S: deployment.id },
      commitHash: { S: deployment.commitHash },
    },
  });
  ddbClient.send(putItemCommand);
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
  });

  const putObjectCommand = new PutObjectCommand({
    Bucket: `sourcefilesbucket-${application.customerId}-${application.id}`,
    Key: `${deploymentId}.zip`,
  });
  return await getSignedUrl(s3Client, putObjectCommand, {
    expiresIn: 3600,
  });
};

const resolvers: Resolvers = {
  Query: {
    hello: () => "world",
  },
  Mutation: {
    createApplication: async (parent, args, contextValue, info) => {
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
      const deploymentId = nanoid();
      const customerId = "JakePartusch"; //TODO: get from auth context
      const application = await findApplicationByName(
        customerId,
        args.applicationName
      );
      if (!application) {
        throw new Error("blah");
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
