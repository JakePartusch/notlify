export const typeDefs = `#graphql
enum AvailableRegions {
  US_EAST_1
  US_EAST_2
  US_WEST_1
  US_WEST_2
}

enum Status {
  PENDING_UPLOAD
  INITIATED
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
  deploymentUploadLocation: String
}

type Query {
  hello: String
  application(id: ID!): Application!
}
type Mutation {
  createApplication(name: String!, region: AvailableRegions!): Application!
  initiateDeployment(applicationName: String!, commitHash: String): Deployment!
}
`;
