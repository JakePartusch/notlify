import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  ARecord,
  AaaaRecord,
  RecordTarget,
  IHostedZone,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
  IDistribution,
  Distribution,
  ViewerProtocolPolicy,
  AllowedMethods,
  CachePolicy,
  DistributionProps,
  Function,
  FunctionCode,
  FunctionEventType,
} from "aws-cdk-lib/aws-cloudfront";
import {
  Code,
  IFunction,
  Runtime,
  Function as Lambda,
} from "aws-cdk-lib/aws-lambda";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  EventType,
  IBucket,
} from "aws-cdk-lib/aws-s3";
import {
  PolicyStatement,
  Effect,
  AnyPrincipal,
  Role,
  AccountPrincipal,
} from "aws-cdk-lib/aws-iam";
import { HttpOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, IHttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { overrideProps } from "./utils";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import {
  LambdaFunction,
  EventBus as EventBusTarget,
} from "aws-cdk-lib/aws-events-targets";

interface Domain {
  /**
   * The custom domain name for this deployment
   */
  domainName: string;
  /**
   * The hosted zone associated with the custom domain
   */
  hostedZone: IHostedZone;
  /**
   * The wildcard certificate for this custom domain
   */
  certificate: ICertificate;
}

interface DataPlaneConstructProps {
  customerId: string;
  applicationId: string;
  /**
   * The unique id to use in generating the infrastructure and domain. Only used with custom domains
   * Ex. https://{buildId}.my-domain.com
   */
  buildId?: string;
  /**
   * The custom domain to use for this deployment
   */
  domain?: Domain;
  /**
   * Paths to the entry files (JavaScript or TypeScript).
   */
  apiEntries: {
    name: string;
    runtime: Runtime;
    sourceCodeZipName: string;
  }[];
  /**
   * The sources from which to deploy the contents of the bucket.
   */
  sourceFilesZipName?: string;
  /**
   * Key-value pairs that Lambda caches and makes available for your Lambda functions.
   *
   * Use environment variables to apply configuration changes, such
   * as test and production environment configurations, without changing your
   * Lambda function source code.
   *
   * @default - No environment variables.
   */
  readonly apiEnvironment?: {
    [key: string]: string;
  };
  /**
   * Optional user provided props to merge with the default props for CloudFront Distribution
   */
  cloudFrontDistributionProps?: Partial<DistributionProps>;
  /**
   * Experimental - Make the S3 bucket private and use a Cloudfront function to rewrite website URLs
   */
  isPrivateS3?: boolean;
}

export class DataPlaneConstruct extends Construct {
  /**
   * The s3 bucket the website is deployed to
   */
  readonly websiteBucket: IBucket;
  /**
   * The API Gateway API for the function deployments
   */
  readonly httpApi: IHttpApi;
  /**
   * The Node.js Lambda Functions deployed
   */
  readonly functions: IFunction[];
  /**
   * The Cloudfront web distribution for the website and API Gateways
   */
  readonly distribution: IDistribution;

  constructor(scope: Construct, id: string, props: DataPlaneConstructProps) {
    super(scope, id);

    const sourceFilesBucket = new Bucket(this, "SourceFilesBucket", {
      bucketName:
        `sourcefilesbucket-${props.customerId}-${props.applicationId}`.toLowerCase(),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const sourceFilesCrossAccountRole = new Role(
      this,
      "SourceFilesCrossAccountRole",
      {
        assumedBy: new AccountPrincipal("857786057494"),
        roleName: `CrossAccountRole-${props.customerId}-${props.applicationId}`,
      }
    );

    sourceFilesBucket.grantWrite(sourceFilesCrossAccountRole);

    const cloudFormationEventHandler = new NodejsFunction(
      this,
      "CloudformationEventHandler",
      {
        entry: path.join(
          __dirname,
          "../src/data-plane/cloudformation-event-handler.ts"
        ),
        runtime: Runtime.NODEJS_18_X,
        memorySize: 512,
        timeout: Duration.seconds(30),
      }
    );
    const controlPlaneEventBus = EventBus.fromEventBusArn(
      this,
      "ControlPlaneEventBus",
      "arn:aws:events:us-east-1:857786057494:event-bus/CloudformationEventBus"
    );

    new Rule(this, "rule", {
      eventPattern: {
        source: ["aws.cloudformation"],
      },
      targets: [
        new LambdaFunction(cloudFormationEventHandler),
        new EventBusTarget(controlPlaneEventBus),
      ],
    });

    controlPlaneEventBus.grantPutEventsTo;

    new CfnOutput(this, "SourceFilesCrossAccountRoleArnOutput", {
      value: sourceFilesCrossAccountRole.roleArn,
    });

    new CfnOutput(this, "SourceFilesBuckeArnOutput", {
      value: sourceFilesBucket.bucketArn,
    });

    const websiteBucket = new Bucket(this, "WebsiteBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      ...(!props.isPrivateS3
        ? {
            publicReadAccess: true,
            websiteIndexDocument: "index.html",
          }
        : {}),
    });

    new CfnOutput(this, "WebsiteBucketBuckeArnOutput", {
      value: websiteBucket.bucketArn,
    });

    if (props.isPrivateS3) {
      // Apply bucket policy to enforce encryption of data in transit
      websiteBucket.addToResourcePolicy(
        new PolicyStatement({
          sid: "HttpsOnly",
          resources: [`${websiteBucket.bucketArn}/*`],
          actions: ["*"],
          principals: [new AnyPrincipal()],
          effect: Effect.DENY,
          conditions: {
            Bool: {
              "aws:SecureTransport": "false",
            },
          },
        })
      );
    }

    /**
     * URL rewrite to append index.html to the URI for single page applications
     */
    const createRewriteFunction = () => {
      return new Function(this, "CloudFrontFunction", {
        code: FunctionCode.fromInline(`
         function handler(event) {
           var request = event.request;
           var uri = request.uri;
           
           // Check whether the URI is missing a file name.
           if (uri.endsWith('/')) {
               request.uri += 'index.html';
           } 
           // Check whether the URI is missing a file extension.
           else if (!uri.includes('.')) {
               request.uri += '/index.html';
           }
       
           return request;
         }`),
      });
    };

    const lambdas = props.apiEntries.map((functionFile) => {
      return new Lambda(this, `Function-${functionFile.name}`, {
        handler: "handler",
        code: Code.fromBucket(
          sourceFilesBucket,
          functionFile.sourceCodeZipName
        ),
        runtime: functionFile.runtime,
        environment: {
          ...props.apiEnvironment,
        },
      });
    });

    const httpApi = new HttpApi(this, "HttpApi");

    lambdas.forEach((lambda, i) => {
      const lambdaFileName = props.apiEntries[i].name;
      const lambdaProxyIntegration = new HttpLambdaIntegration(
        `LambdaIntegration${i}`,
        lambda
      );

      httpApi.addRoutes({
        path: `/api/${lambdaFileName}`,
        integration: lambdaProxyIntegration,
      });
    });

    /**
     * Build a Cloudfront behavior for each api function that allows all HTTP Methods and has caching disabled.
     */
    const additionalBehaviors = {
      "/api/*": {
        origin: new HttpOrigin(
          `${httpApi.apiId}.execute-api.${Stack.of(this).region}.amazonaws.com`
        ),
        cachePolicy: CachePolicy.CACHING_DISABLED,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    };

    const defaultDistributionProps = {
      defaultBehavior: {
        origin: new S3Origin(websiteBucket),
        allowedMethods: AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        functionAssociations: [
          ...(props.isPrivateS3
            ? [
                {
                  function: createRewriteFunction(),
                  eventType: FunctionEventType.VIEWER_REQUEST,
                },
              ]
            : []),
        ],
      },
      defaultRootObject: "index.html",
      additionalBehaviors,
      certificate: props.domain?.certificate,
      domainNames: props.domain
        ? [
            props.buildId
              ? `${props.buildId}.${props.domain.domainName}`
              : `www.${props.domain.domainName}`,
          ]
        : undefined,
      enableLogging: true,
    };

    const mergedDistributionProps = overrideProps(
      defaultDistributionProps,
      props.cloudFrontDistributionProps ?? {}
    );

    /**
     * Creating a Cloudfront distribution for the website bucket with an aggressive caching policy
     */
    const distribution = new Distribution(
      this,
      "Distribution",
      mergedDistributionProps
    );

    if (props.sourceFilesZipName) {
      new BucketDeployment(this, "BucketDeployment", {
        sources: [Source.bucket(sourceFilesBucket, props.sourceFilesZipName)],
        destinationKeyPrefix: "/",
        destinationBucket: websiteBucket!,
        distribution: distribution,
        retainOnDelete: false,
      });
    }

    if (props.domain) {
      new ARecord(this, "IPv4 AliasRecord", {
        zone: props.domain.hostedZone,
        recordName: props.buildId ?? "www",
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      });

      new AaaaRecord(this, "IPv6 AliasRecord", {
        zone: props.domain.hostedZone,
        recordName: props.buildId ?? "www",
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      });
    }
    if (!props.domain) {
      new CfnOutput(this, "Base Url", {
        value: `https://${distribution.distributionDomainName}`,
      });
    } else {
      new CfnOutput(this, "Base Url", {
        value: props.buildId
          ? `https://${props.buildId}.${props.domain.domainName}`
          : `https://www.${props.domain.domainName}`,
      });
    }

    props.apiEntries.map((apiEntry) => {
      if (props.domain) {
        new CfnOutput(this, `Function Path - ${apiEntry.name}`, {
          value: props.buildId
            ? `https://${props.buildId}.${props.domain.domainName}/api/${apiEntry.name}`
            : `https://www.${props.domain.domainName}/api`,
        });
      } else {
        new CfnOutput(this, `Function Path - ${apiEntry.name}`, {
          value: `https://${distribution.distributionDomainName}/api/${apiEntry.name}`,
        });
      }
    });

    this.websiteBucket = websiteBucket;
    this.httpApi = httpApi;
    this.functions = lambdas;
    this.distribution = distribution;
  }
}
