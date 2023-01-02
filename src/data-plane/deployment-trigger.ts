import { S3Event } from "aws-lambda";
const triggerDataPlaneDeployment = async (
  customerId: string,
  applicationId: string,
  region: string,
  sourceFilesZipName: string
) => {
  //@ts-ignore
  await fetch(
    `https://api.github.com/repos/JakePartusch/paas-app/actions/workflows/data-plane-deploy.yml/dispatches`,
    {
      method: "POST",
      body: JSON.stringify({
        ref: "main",
        inputs: {
          customerId,
          applicationId,
          region,
          sourceFilesZipName,
        },
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );
};

export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const objectKey = record.s3.object.key;
    const customerId = objectKey.split("-").at(0);
    const applicationId = objectKey.split("-").at(1);
    if (!customerId || !applicationId || !process.env.AWS_REGION) {
      throw new Error("blah");
    }
    await triggerDataPlaneDeployment(
      customerId,
      applicationId,
      process.env.AWS_REGION,
      objectKey
    );
  }
};
