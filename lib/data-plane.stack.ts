import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DataPlaneConstruct } from "./data-pane.construct";

interface DataPlaneStackProps extends cdk.StackProps {
  sourceFilesZipName: string;
}

export class DataPlaneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: DataPlaneStackProps) {
    super(scope, id, props);

    new DataPlaneConstruct(this, `DataPlane`, {
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
