import { S3Event, EventBridgeEvent } from "aws-lambda";

interface CloudformationDetail {
  "stack-id": "arn:aws:cloudformation:us-west-1:111122223333:stack/teststack";
  "logical-resource-id": "my-s3-bucket";
  "physical-resource-id": "arn:aws:s3:::my-s3-bucket-us-east-1";
  "status-details": {
    status: "CREATE_COMPLETE";
    "status-reason": "";
  };
  "resource-type": "AWS::S3::Bucket";
  "client-request-token": "";
}
export const handler = async (
  event: EventBridgeEvent<
    "CloudFormation Resource Status Change",
    CloudformationDetail
  >
) => {
  console.log(JSON.stringify(event, null, 2));
};
