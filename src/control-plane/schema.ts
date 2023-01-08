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
}

type Deployment {
  id: ID!
  status: Status!
  commitHash: String!
}

type InitiateDeploymentResponse {
  id: ID!
  status: Status!
  commitHash: String!
  deploymentUploadLocation: String
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
  createApplication(name: String!, region: AvailableRegions!): Application!
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
