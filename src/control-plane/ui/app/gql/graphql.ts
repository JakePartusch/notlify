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
  applicationType: ApplicationType;
  customerId: Scalars['String'];
  deploymentUrl?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  id: Scalars['ID'];
  lastDeploymentTime?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  region: AvailableRegions;
  repository: Scalars['String'];
  status: ApplicationStatus;
};

export type ApplicationQueryInput = {
  id?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
};

export enum ApplicationStatus {
  CreateComplete = 'CREATE_COMPLETE',
  CreateFailed = 'CREATE_FAILED',
  CreateRequested = 'CREATE_REQUESTED',
  DeploymentComplete = 'DEPLOYMENT_COMPLETE',
  DeploymentFailed = 'DEPLOYMENT_FAILED',
  DeploymentInitiated = 'DEPLOYMENT_INITIATED'
}

export enum ApplicationType {
  Astro = 'ASTRO',
  NextJs = 'NEXT_JS',
  Remix = 'REMIX',
  Solid = 'SOLID',
  Static = 'STATIC'
}

export enum AvailableRegions {
  UsEast_1 = 'US_EAST_1',
  UsEast_2 = 'US_EAST_2',
  UsWest_1 = 'US_WEST_1',
  UsWest_2 = 'US_WEST_2'
}

export type CreateApplicationInput = {
  applicationType: ApplicationType;
  description: Scalars['String'];
  name: Scalars['String'];
  region: AvailableRegions;
  repository: Scalars['String'];
};

export type Deployment = {
  __typename?: 'Deployment';
  commitHash: Scalars['String'];
  completionTime?: Maybe<Scalars['String']>;
  deploymentUrl?: Maybe<Scalars['String']>;
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
  listApplications: Array<Application>;
  listDeployments: Array<Deployment>;
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

export type MutationMutationVariables = Exact<{
  input: CreateApplicationInput;
}>;


export type MutationMutation = { __typename?: 'Mutation', createApplication: { __typename?: 'Application', id: string } };

export type ListAllApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAllApplicationsQuery = { __typename?: 'Query', listApplications: Array<{ __typename?: 'Application', customerId: string, id: string, name: string, region: AvailableRegions, repository: string, lastDeploymentTime?: string | null, deploymentUrl?: string | null, description: string, applicationType: ApplicationType, status: ApplicationStatus }> };


export const MutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Mutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateApplicationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createApplication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<MutationMutation, MutationMutationVariables>;
export const ListAllApplicationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListAllApplications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listApplications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"repository"}},{"kind":"Field","name":{"kind":"Name","value":"lastDeploymentTime"}},{"kind":"Field","name":{"kind":"Name","value":"deploymentUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"applicationType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ListAllApplicationsQuery, ListAllApplicationsQueryVariables>;