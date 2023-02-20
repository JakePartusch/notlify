import * as cdk from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { DataPlaneConstruct, Domain } from "./data-plane.construct";

interface DataPlaneStackProps extends cdk.StackProps {
  sourceFilesZipName?: string;
  customerId: string;
  applicationId: string;
  domainName?: string;
  zoneId?: string;
  certificateArn?: string;
}

export class DataPlaneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DataPlaneStackProps) {
    super(scope, id, props);

    const domain =
      props.domainName && props.zoneId && props.certificateArn
        ? {
            domainName: props.domainName,
            hostedZone: HostedZone.fromHostedZoneAttributes(
              this,
              "HostedZone",
              {
                hostedZoneId: props.zoneId,
                zoneName: props.domainName,
              }
            ),
            certificate: Certificate.fromCertificateArn(
              this,
              "Certificate",
              props.certificateArn
            ),
          }
        : undefined;

    new DataPlaneConstruct(this, `DataPlane`, {
      customerId: props.customerId,
      applicationId: props.applicationId,
      sourceFilesZipName: props?.sourceFilesZipName,
      apiEntries: [], //TODO
      apiEnvironment: undefined, //TODO
      buildId: undefined, //TODO
      cloudFrontDistributionProps: undefined, //TODO
      domain,
      isPrivateS3: true,
    });
  }
}
