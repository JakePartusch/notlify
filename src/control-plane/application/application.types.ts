import { Application } from "../generated/graphql.types";

export interface InternalApplication extends Application {
  awsAccountId: string;
  domain?: string;
  domainZoneId?: string;
  domainCertificateArn?: string;
}

export interface InternalApiKey {
  customerId: string;
}
