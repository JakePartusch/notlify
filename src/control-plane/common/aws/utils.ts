import { AvailableRegions } from "../../generated/graphql.types";

export const getRegionStringFromGraphqlRegion = (region: AvailableRegions) => {
  return region.toLowerCase().split("_").join("-");
};

export const getDataPlaneSourceFilesBucketName = (
  customerId: string,
  applicationId: string
) => {
  return `sourcefilesbucket-${customerId}-${applicationId}`.toLowerCase();
};

export const getDataPlaneCrossAccountRoleArn = (
  awsAccountId: string,
  customerId: string,
  applicationId: string
) => {
  return `arn:aws:iam::${awsAccountId}:role/CrossAccountRole-${customerId}-${applicationId}`;
};

export const getDeploymentObjectKey = (
  customerId: string,
  applicationId: string,
  deploymentId: string
) => {
  return `${customerId}-${applicationId}-${deploymentId}.zip`;
};
