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

enum ApplicationType {
  NEXT_JS
  REMIX
  ASTRO
  SOLID
  STATIC
}

enum ApplicationStatus {
  CREATE_REQUESTED
  CREATE_COMPLETE
  CREATE_FAILED
  DEPLOYMENT_INITIATED
  DEPLOYMENT_COMPLETE
  DEPLOYMENT_FAILED
}

type Application {
  id: ID!
  name: String!
  region: AvailableRegions!
  customerId: String!
  repository: String!
  description: String!
  applicationType: ApplicationType!
  status: ApplicationStatus!
  lastDeploymentTime: String
  deploymentUrl: String
  apiKey: String
}

type Deployment {
  id: ID!
  status: Status!
  commitHash: String!
  startTime: String
  completionTime: String
  deploymentUrl: String
}

type InitiateDeploymentResponse {
  id: ID!
  status: Status!
  commitHash: String!
  startTime: String
  deploymentUploadLocation: String
}

type DeleteApplicationResponse {
  message: String!
}

input CreateApplicationInput {
  name: String!
  repository: String!
  region: AvailableRegions!
  description: String!
  applicationType: ApplicationType!
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

input DeleteApplicationInput {
  name: String
  id: ID
}

type Query {
  listApplications: [Application!]!
  getApplication(input: ApplicationQueryInput!): Application!
  listDeployments(input: ListDeploymentsInput!): [Deployment!]!
  getDeployment(input: GetDeploymentInput!): Deployment!
}
type Mutation {
  createApplication(input: CreateApplicationInput!): Application!
  initiateDeployment(
    input: InitiateDeploymentInput!
  ): InitiateDeploymentResponse!
  deleteApplication(input: DeleteApplicationInput!): DeleteApplicationResponse!
}

schema {
  query: Query
  mutation: Mutation
}
`;
