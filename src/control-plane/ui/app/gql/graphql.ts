/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Application = {
  __typename?: 'Application';
  customerId: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  region: AvailableRegions;
  repository: Scalars['String'];
};

export type ApplicationQueryInput = {
  id?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
};

export enum AvailableRegions {
  UsEast_1 = 'US_EAST_1',
  UsEast_2 = 'US_EAST_2',
  UsWest_1 = 'US_WEST_1',
  UsWest_2 = 'US_WEST_2'
}

export type CreateApplicationInput = {
  name: Scalars['String'];
  region: AvailableRegions;
  repository: Scalars['String'];
};

export type Deployment = {
  __typename?: 'Deployment';
  commitHash: Scalars['String'];
  completionTime?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  startTime?: Maybe<Scalars['String']>;
  status: Status;
};

export type GetDeploymentInput = {
  applicationId: Scalars['ID'];
  deploymentId: Scalars['ID'];
};

export type InitiateDeploymentInput = {
  applicationName: Scalars['String'];
  commitHash: Scalars['String'];
};

export type InitiateDeploymentResponse = {
  __typename?: 'InitiateDeploymentResponse';
  commitHash: Scalars['String'];
  deploymentUploadLocation?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  startTime?: Maybe<Scalars['String']>;
  status: Status;
};

export type ListDeploymentsInput = {
  applicationId: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createApplication: Application;
  initiateDeployment: InitiateDeploymentResponse;
};


export type MutationCreateApplicationArgs = {
  input: CreateApplicationInput;
};


export type MutationInitiateDeploymentArgs = {
  input: InitiateDeploymentInput;
};

export type Query = {
  __typename?: 'Query';
  getApplication: Application;
  getDeployment: Deployment;
  listApplications: Array<Maybe<Application>>;
  listDeployments: Array<Maybe<Deployment>>;
};


export type QueryGetApplicationArgs = {
  input: ApplicationQueryInput;
};


export type QueryGetDeploymentArgs = {
  input: GetDeploymentInput;
};


export type QueryListDeploymentsArgs = {
  input: ListDeploymentsInput;
};

export enum Status {
  Complete = 'COMPLETE',
  DeploymentInitiated = 'DEPLOYMENT_INITIATED',
  PendingUpload = 'PENDING_UPLOAD'
}

export type ListAllApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAllApplicationsQuery = { __typename?: 'Query', listApplications: Array<{ __typename?: 'Application', customerId: string, id: string, name: string, region: AvailableRegions, repository: string } | null> };


export const ListAllApplicationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListAllApplications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listApplications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"repository"}}]}}]}}]} as unknown as DocumentNode<ListAllApplicationsQuery, ListAllApplicationsQueryVariables>;