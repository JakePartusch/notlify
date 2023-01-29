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

type Query {
  application(input: ApplicationQueryInput!): Application!
  deployment(applicationId: ID!, deploymentId: ID!): Deployment!
}
type Mutation {
  createApplication(input: CreateApplicationInput!): Application!
  initiateDeployment(
    applicationName: String!
    commitHash: String!
  ): InitiateDeploymentResponse!
}

schema {
  query: Query
  mutation: Mutation
}

`;
