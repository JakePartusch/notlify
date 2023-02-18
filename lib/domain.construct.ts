import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import { IHostedZone, PublicHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

interface DomainCertificateProps {
  /**
   * Domain to be used to generate the Route53 zone and wildcard certificate
   * Ex: google.com
   */
  domainName: string;
}

export class Domain extends Construct {
  readonly hostedZone: IHostedZone;
  readonly certificate: ICertificate;
  constructor(scope: Construct, id: string, props: DomainCertificateProps) {
    super(scope, id);

    const hostedZone = new PublicHostedZone(this, "HostedZone", {
      zoneName: props.domainName,
    });

    const certificate = new Certificate(this, "Certificate", {
      domainName: `*.${props.domainName}`,
      validation: CertificateValidation.fromDns(hostedZone),
    });

    this.hostedZone = hostedZone;
    this.certificate = certificate;
  }
}
