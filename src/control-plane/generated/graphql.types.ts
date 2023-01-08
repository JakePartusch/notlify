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
  customerId: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  region: AvailableRegions;
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

export type Deployment = {
  __typename?: 'Deployment';
  commitHash: Scalars['String'];
  id: Scalars['ID'];
  status: Status;
};

export type InitiateDeploymentResponse = {
  __typename?: 'InitiateDeploymentResponse';
  commitHash: Scalars['String'];
  deploymentUploadLocation?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  status: Status;
};

export type Mutation = {
  __typename?: 'Mutation';
  createApplication: Application;
  initiateDeployment: InitiateDeploymentResponse;
};


export type MutationCreateApplicationArgs = {
  name: Scalars['String'];
  region: AvailableRegions;
};


export type MutationInitiateDeploymentArgs = {
  applicationName: Scalars['String'];
  commitHash: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  application: Application;
  deployment: Deployment;
};


export type QueryApplicationArgs = {
  input: ApplicationQueryInput;
};


export type QueryDeploymentArgs = {
  applicationId: Scalars['ID'];
  deploymentId: Scalars['ID'];
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
  AvailableRegions: AvailableRegions;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Deployment: ResolverTypeWrapper<Deployment>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  InitiateDeploymentResponse: ResolverTypeWrapper<InitiateDeploymentResponse>;
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
  Deployment: Deployment;
  ID: Scalars['ID'];
  InitiateDeploymentResponse: InitiateDeploymentResponse;
  Mutation: {};
  Query: {};
  String: Scalars['String'];
};

export type ApplicationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Application'] = ResolversParentTypes['Application']> = {
  customerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['AvailableRegions'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeploymentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Deployment'] = ResolversParentTypes['Deployment']> = {
  commitHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['Status'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InitiateDeploymentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['InitiateDeploymentResponse'] = ResolversParentTypes['InitiateDeploymentResponse']> = {
  commitHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deploymentUploadLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['Status'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createApplication?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationCreateApplicationArgs, 'name' | 'region'>>;
  initiateDeployment?: Resolver<ResolversTypes['InitiateDeploymentResponse'], ParentType, ContextType, RequireFields<MutationInitiateDeploymentArgs, 'applicationName' | 'commitHash'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  application?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<QueryApplicationArgs, 'input'>>;
  deployment?: Resolver<ResolversTypes['Deployment'], ParentType, ContextType, RequireFields<QueryDeploymentArgs, 'applicationId' | 'deploymentId'>>;
};

export type Resolvers<ContextType = any> = {
  Application?: ApplicationResolvers<ContextType>;
  Deployment?: DeploymentResolvers<ContextType>;
  InitiateDeploymentResponse?: InitiateDeploymentResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

