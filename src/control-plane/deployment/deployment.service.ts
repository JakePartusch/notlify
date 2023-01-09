import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InternalApplication } from "../application/application.types";
import { dynamoDbDocumentClient } from "../common/aws/dynamodb.client";
import { getDeploymentObjectKey } from "../common/aws/utils";
import { Deployment, Status } from "../generated/graphql.types";

const { TABLE_NAME, SOURCE_FILES_BUCKET_NAME, AWS_REGION } = process.env;

export const createDeploymentRecord = async (
  deployment: Deployment,
  applicationId: string
) => {
  await dynamoDbDocumentClient.put({
    TableName: TABLE_NAME,
    Item: {
      PK: `APPLICATION#${applicationId}`,
      SK: `DEPLOYMENT#${deployment.id}`,
      type: "DEPLOYMENT",
      ...deployment,
    },
  });
};

export const updateDeploymentStatus = async (
  applicationId: string,
  deploymentId: string,
  status: Status
) => {
  await dynamoDbDocumentClient.update({
    TableName: TABLE_NAME,
    Key: {
      PK: `APPLICATION#${applicationId}`,
      SK: `DEPLOYMENT#${deploymentId}`,
    },
    UpdateExpression: "SET #status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
    },
  });
};

export const getDeploymentById = async (
  applicationId: string,
  deploymentId: string
): Promise<Deployment | undefined> => {
  const response = await dynamoDbDocumentClient.get({
    TableName: TABLE_NAME,
    Key: {
      PK: `APPLICATION#${applicationId}`,
      SK: `DEPLOYMENT#${deploymentId}`,
    },
  });
  return response.Item as Deployment;
};

export const findInitiatedDeploymentsByApplicationId = async (
  applicationId: string
): Promise<Deployment[]> => {
  const response = await dynamoDbDocumentClient.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk",
    FilterExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":pk": `APPLICATION#${applicationId}`,
      ":status": Status.DeploymentInitiated,
    },
  });
  if (response.Items) {
    return response.Items as Deployment[];
  }
  return [];
};

export const getPresignedDeploymentUrl = async (
  application: InternalApplication,
  deploymentId: string
) => {
  const s3Client = new S3Client({
    region: AWS_REGION,
  });

  const putObjectCommand = new PutObjectCommand({
    Bucket: SOURCE_FILES_BUCKET_NAME,
    Key: getDeploymentObjectKey(
      application.customerId,
      application.id,
      deploymentId
    ),
  });
  return await getSignedUrl(s3Client, putObjectCommand, {
    expiresIn: 3600,
  });
};
