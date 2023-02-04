import { dynamoDbDocumentClient } from "../common/aws/dynamodb.client";
import { InternalApplication } from "./application.types";
import fetch from "node-fetch";

const { GITHUB_TOKEN, GITHUB_WORKFLOW_URL, TABLE_NAME } = process.env;

export const findApplicationByName = async (
  customerId: string,
  applicationName: string
): Promise<InternalApplication | undefined> => {
  const items = await findAllApplicationsByCustomerId(customerId);
  return items?.find((item) => item.name === applicationName);
};

export const findAllApplicationsByCustomerId = async (
  customerId: string
): Promise<InternalApplication[]> => {
  const response = await dynamoDbDocumentClient.query({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :gsi1pk",
    ExpressionAttributeValues: {
      ":gsi1pk": `CUSTOMER#${customerId}`,
    },
  });
  if (!response.Items) {
    return [];
  }
  return response.Items as InternalApplication[];
};

export const getApplicationById = async (
  applicationId: string
): Promise<InternalApplication> => {
  const response = await dynamoDbDocumentClient.get({
    TableName: TABLE_NAME,
    Key: {
      PK: `APPLICATION#${applicationId}`,
      SK: `APPLICATION#${applicationId}`,
    },
  });
  return response.Item as InternalApplication;
};

export const createApplicationRecord = async (
  application: InternalApplication
) => {
  await dynamoDbDocumentClient.put({
    TableName: TABLE_NAME,
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

export const triggerDataPlaneUpdate = async (
  application: InternalApplication
) => {
  if (!GITHUB_TOKEN || !GITHUB_WORKFLOW_URL) {
    throw new Error("Invalid configuration");
  }
  await fetch(GITHUB_WORKFLOW_URL, {
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
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });
};
