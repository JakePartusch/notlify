import { S3Event } from "aws-lambda";
import fetch from "node-fetch";
import {
  getApplicationById,
  updateApplicationToInitiated,
} from "../application/application.service";
import {
  getDeploymentById,
  updateDeploymentToInitiated,
} from "../deployment/deployment.service";
import { Status } from "../generated/graphql.types";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  getDataPlaneCrossAccountRoleArn,
  getDataPlaneSourceFilesBucketName,
  getRegionStringFromGraphqlRegion,
} from "../common/aws/utils";
import { InternalApplication } from "../application/application.types";
import { trace } from "@opentelemetry/api";

const { AWS_REGION, GITHUB_TOKEN, GITHUB_WORKFLOW_URL } = process.env;

const triggerDataPlaneDeployment = async (
  application: InternalApplication,
  sourceFilesZipName: string
) => {
  try {
    const response = await fetch(GITHUB_WORKFLOW_URL ?? "", {
      method: "POST",
      body: JSON.stringify({
        ref: "main",
        inputs: {
          customerId: application.customerId,
          applicationId: application.id,
          awsAccountId: application.awsAccountId,
          region: getRegionStringFromGraphqlRegion(application.region),
          sourceFilesZipName,
          domain: application.domain,
          domainZoneId: application.domainZoneId,
          domainCertificateArn: application.domainCertificateArn,
        },
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });
    const responseText = await response.text();
  } catch (e) {
    console.error("Unable to trigger workflow", e);
  }
};

export const handler = async (event: S3Event) => {
  console.log(JSON.stringify(event, null, 2));
  const tracer = trace
    .getTracer(process.env.OTEL_SERVICE_NAME!)
    .startSpan("api-handler", { root: false });
  for (const record of event.Records) {
    const objectKey = record.s3.object.key;
    const customerId = objectKey.split("-").at(0);
    const applicationId = objectKey.split("-").at(1);
    const deploymentId = objectKey.split("-")?.at(2)?.split(".")?.at(0);
    if (!customerId || !applicationId || !deploymentId || !AWS_REGION) {
      throw new Error(
        `Invalid file configuration, customerId=${customerId}, applicationId=${applicationId}, deploymentId=${deploymentId}, region=${AWS_REGION}`
      );
    }

    const application = await getApplicationById(applicationId);
    const deployment = await getDeploymentById(application.id, deploymentId);
    const hasPendingDeployment = deployment?.status === Status.PendingUpload;
    if (hasPendingDeployment) {
      const getObjectCommand = new GetObjectCommand({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      });
      const s3Client = new S3Client({ region: AWS_REGION });
      const s3response = await s3Client.send(getObjectCommand);
      const s3ResponseByteArray = await s3response.Body?.transformToByteArray();
      const credentials = fromTemporaryCredentials({
        params: {
          RoleArn: getDataPlaneCrossAccountRoleArn(
            application.awsAccountId,
            application.customerId,
            application.id
          ),
        },
      });
      const region = getRegionStringFromGraphqlRegion(application.region);
      const crossAccountS3Client = new S3Client({
        credentials,
        region,
      });

      const putObjectCommand = new PutObjectCommand({
        Bucket: getDataPlaneSourceFilesBucketName(customerId, application.id),
        Key: objectKey,
        Body: s3ResponseByteArray,
      });
      await crossAccountS3Client.send(putObjectCommand);
      await updateDeploymentToInitiated(application.id, deploymentId);
      await updateApplicationToInitiated(application.id);
      await triggerDataPlaneDeployment(application, objectKey);
    } else {
      throw new Error(
        `No pending deployment for app ${applicationId} with deploymentId ${deploymentId}`
      );
    }
  }
  tracer.end();
};
