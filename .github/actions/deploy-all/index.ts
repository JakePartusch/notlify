import * as core from "@actions/core";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import fetch, { Headers } from "node-fetch";

interface InternalApplication {
  customerId: string;
  id: string;
  awsAccountId: string;
  region: string;
  domainConfig?: string;
}

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
export const dynamoDbDocumentClient = DynamoDBDocument.from(ddbClient);

export const findAllApplications = async (
  tableName: string
): Promise<InternalApplication[]> => {
  const response = await dynamoDbDocumentClient.scan({
    TableName: tableName,
    FilterExpression: "#type = :type",
    ExpressionAttributeNames: {
      "#type": "type",
    },
    ExpressionAttributeValues: {
      ":type": "APPLICATION",
    },
  });
  if (!response.Items) {
    return [];
  }
  return response.Items as InternalApplication[];
};

export const triggerDataPlaneUpdate = async (
  gitHubWorkflowurl: string,
  gitHubToken: string,
  application: InternalApplication
) => {
  await fetch(gitHubWorkflowurl, {
    method: "POST",
    body: JSON.stringify({
      ref: "main",
      inputs: {
        customerId: application.customerId,
        applicationId: application.id,
        awsAccountId: application.awsAccountId,
        region: application.region.replaceAll("_", "-").toLowerCase(),
        domainConfig: application.domainConfig,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${gitHubToken}`,
    },
  });
};

(async () => {
  const TABLE_NAME = core.getInput("controlPlaneTable");
  const GITHUB_WORKFLOW_URL = core.getInput("gitHubWorkflowUrl");
  const GITHUB_TOKEN = core.getInput("gitHubToken");
  const applications = await findAllApplications(TABLE_NAME);
  for (const application of applications) {
    await triggerDataPlaneUpdate(
      GITHUB_WORKFLOW_URL,
      GITHUB_TOKEN,
      application
    );
  }
  // Fetch all applications from the database using Dynamodb
  // For each applicattion, trigger a data plane deployment github action
})();
