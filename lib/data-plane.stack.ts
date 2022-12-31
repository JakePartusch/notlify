import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DataPlaneConstruct } from "./data-plane.construct";

interface DataPlaneStackProps extends cdk.StackProps {
  sourceFilesZipName?: string;
  customerId: string;
  applicationId: string;
}

export class DataPlaneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DataPlaneStackProps) {
    super(scope, id, props);

    new DataPlaneConstruct(this, `DataPlane`, {
      customerId: props.customerId,
      applicationId: props.applicationId,
      sourceFilesZipName: props?.sourceFilesZipName, //TODO
      apiEntries: [], //TODO
      apiEnvironment: undefined, //TODO
      buildId: undefined, //TODO
      cloudFrontDistributionProps: undefined, //TODO
      domain: undefined, //TODO
      isPrivateS3: false, //TODO
    });
  }
}
