import { Application } from "../generated/graphql.types";

export interface InternalApplication extends Application {
  awsAccountId: string;
}
