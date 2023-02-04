export const typeDefs = `#graphql
enum AvailableRegions {
  US_EAST_1
  US_EAST_2
  US_WEST_1
  US_WEST_2
}

enum Status {
  PENDING_UPLOAD
  DEPLOYMENT_INITIATED
  COMPLETE
}

type Application {
  id: ID!
  name: String!
  region: AvailableRegions!
  customerId: String!
  repository: String!
}

type Deployment {
  id: ID!
  status: Status!
  commitHash: String!
  startTime: String
  completionTime: String
}

type InitiateDeploymentResponse {
  id: ID!
  status: Status!
  commitHash: String!
  startTime: String
  deploymentUploadLocation: String
}

input CreateApplicationInput {
  name: String!
  repository: String!
  region: AvailableRegions!
}

input ApplicationQueryInput {
  id: ID
  name: String
}

input ListDeploymentsInput {
  applicationId: ID!
}

input GetDeploymentInput {
  applicationId: ID!
  deploymentId: ID!
}

input InitiateDeploymentInput {
  applicationName: String!
  commitHash: String!
}

type Query {
  listApplications: [Application]!
  getApplication(input: ApplicationQueryInput!): Application!
  listDeployments(input: ListDeploymentsInput!): [Deployment]!
  getDeployment(input: GetDeploymentInput!): Deployment!
}
type Mutation {
  createApplication(input: CreateApplicationInput!): Application!
  initiateDeployment(
    input: InitiateDeploymentInput!
  ): InitiateDeploymentResponse!
}

schema {
  query: Query
  mutation: Mutation
}
`;
