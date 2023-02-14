import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type DeleteApplicationInput = {
  id?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
};

export type DeleteApplicationResponse = {
  __typename?: 'DeleteApplicationResponse';
  message: Scalars['String'];
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
  deleteApplication: DeleteApplicationResponse;
  initiateDeployment: InitiateDeploymentResponse;
};


export type MutationCreateApplicationArgs = {
  input: CreateApplicationInput;
};


export type MutationDeleteApplicationArgs = {
  input: DeleteApplicationInput;
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Application: ResolverTypeWrapper<Application>;
  ApplicationQueryInput: ApplicationQueryInput;
  ApplicationStatus: ApplicationStatus;
  ApplicationType: ApplicationType;
  AvailableRegions: AvailableRegions;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CreateApplicationInput: CreateApplicationInput;
  DeleteApplicationInput: DeleteApplicationInput;
  DeleteApplicationResponse: ResolverTypeWrapper<DeleteApplicationResponse>;
  Deployment: ResolverTypeWrapper<Deployment>;
  GetDeploymentInput: GetDeploymentInput;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  InitiateDeploymentInput: InitiateDeploymentInput;
  InitiateDeploymentResponse: ResolverTypeWrapper<InitiateDeploymentResponse>;
  ListDeploymentsInput: ListDeploymentsInput;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Status: Status;
  String: ResolverTypeWrapper<Scalars['String']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Application: Application;
  ApplicationQueryInput: ApplicationQueryInput;
  Boolean: Scalars['Boolean'];
  CreateApplicationInput: CreateApplicationInput;
  DeleteApplicationInput: DeleteApplicationInput;
  DeleteApplicationResponse: DeleteApplicationResponse;
  Deployment: Deployment;
  GetDeploymentInput: GetDeploymentInput;
  ID: Scalars['ID'];
  InitiateDeploymentInput: InitiateDeploymentInput;
  InitiateDeploymentResponse: InitiateDeploymentResponse;
  ListDeploymentsInput: ListDeploymentsInput;
  Mutation: {};
  Query: {};
  String: Scalars['String'];
};

export type ApplicationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Application'] = ResolversParentTypes['Application']> = {
  applicationType?: Resolver<ResolversTypes['ApplicationType'], ParentType, ContextType>;
  customerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deploymentUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastDeploymentTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['AvailableRegions'], ParentType, ContextType>;
  repository?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ApplicationStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteApplicationResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteApplicationResponse'] = ResolversParentTypes['DeleteApplicationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeploymentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Deployment'] = ResolversParentTypes['Deployment']> = {
  commitHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  completionTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deploymentUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['Status'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InitiateDeploymentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['InitiateDeploymentResponse'] = ResolversParentTypes['InitiateDeploymentResponse']> = {
  commitHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deploymentUploadLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['Status'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createApplication?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationCreateApplicationArgs, 'input'>>;
  deleteApplication?: Resolver<ResolversTypes['DeleteApplicationResponse'], ParentType, ContextType, RequireFields<MutationDeleteApplicationArgs, 'input'>>;
  initiateDeployment?: Resolver<ResolversTypes['InitiateDeploymentResponse'], ParentType, ContextType, RequireFields<MutationInitiateDeploymentArgs, 'input'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getApplication?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<QueryGetApplicationArgs, 'input'>>;
  getDeployment?: Resolver<ResolversTypes['Deployment'], ParentType, ContextType, RequireFields<QueryGetDeploymentArgs, 'input'>>;
  listApplications?: Resolver<Array<ResolversTypes['Application']>, ParentType, ContextType>;
  listDeployments?: Resolver<Array<ResolversTypes['Deployment']>, ParentType, ContextType, RequireFields<QueryListDeploymentsArgs, 'input'>>;
};

export type Resolvers<ContextType = any> = {
  Application?: ApplicationResolvers<ContextType>;
  DeleteApplicationResponse?: DeleteApplicationResponseResolvers<ContextType>;
  Deployment?: DeploymentResolvers<ContextType>;
  InitiateDeploymentResponse?: InitiateDeploymentResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

