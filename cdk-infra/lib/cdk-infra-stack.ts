import * as cdk from "aws-cdk-lib";
import {
  AllowedMethods,
  Distribution,
  OriginProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import {
  LoadBalancerV2Origin,
  S3Origin,
} from "aws-cdk-lib/aws-cloudfront-origins";
import { Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import {
  Cluster,
  ContainerImage,
  FargateTaskDefinition,
  LogDriver,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

export class CdkInfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const APP_PORT = 3000;
    const STATIC_NEXT_PATH = "_next/static";
    const pathToDockerFile = "../front-end";

    const vpc = new Vpc(this, "MyVpc", {
      maxAzs: 2,
    });

    const taskDefinition = new FargateTaskDefinition(this, "MyTaskDefinition", {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });

    const dockerFile = new DockerImageAsset(this, "DockerFileAsset", {
      directory: pathToDockerFile,
      file: "Dockerfile",
    });

    // cdk will build it and push it to en ecr repository
    const image = ContainerImage.fromDockerImageAsset(dockerFile);

    const container = taskDefinition.addContainer("MyContainer", {
      image,
      // store the logs in cloudwatch
      logging: LogDriver.awsLogs({ streamPrefix: "myexample-logs" }),
    });

    container.addPortMappings({
      containerPort: APP_PORT,
    });

    const cluster = new Cluster(this, "MyECSCluster", {
      clusterName: "MyECSCluster",
      containerInsights: true,
      vpc,
    });

    const securityGroup = new SecurityGroup(this, `My-security-group`, {
      vpc: vpc,
      allowAllOutbound: true,
      description: "My Security Group",
    });

    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(APP_PORT));

    const fargateService = new ApplicationLoadBalancedFargateService(
      this,
      "MyFargateService",
      {
        cluster,
        publicLoadBalancer: true,
        cpu: 256, // These are overridden by Task Definition if the values are also set there
        desiredCount: 1, // These are overridden by Task Definition if the values are also set there
        memoryLimitMiB: 512,
        taskDefinition,
        securityGroups: [securityGroup],
      }
    );

    const scalableTarget = fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 2,
    });

    scalableTarget.scaleOnCpuUtilization("cpuScaling", {
      targetUtilizationPercent: 70,
    });

    const staticAssetsBucket = new Bucket(this, "StaticAssets", {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      bucketName: `next-static-assets-next-stack-sf`,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // directory to be zipped
   const srcCodeDir = '../front-end';
   // target directory
   const trgBucketCodeDir = '_next/static';
  // zip directory, hashed name
   const CodeAsset = Source.asset(srcCodeDir);

   // Deploy as zip
    const zipBucketDeployment = new BucketDeployment(this, 'Static Assets', {
      sources: [CodeAsset],
      destinationBucket: staticAssetsBucket,
      destinationKeyPrefix: trgBucketCodeDir,
      extract: true,
      prune: false
    });

    // Cloudfront to sit in front of load balancer
    const cdn = new Distribution(this, "CDN", {
      defaultBehavior: {
        origin: new LoadBalancerV2Origin(fargateService.loadBalancer, {
          protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
        }),
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
      // static assets behaviour
      additionalBehaviors: {
        [STATIC_NEXT_PATH]: {
          origin: new S3Origin(staticAssetsBucket),
        },
      },
    });

    new cdk.CfnOutput(this, "CDNOutput", {
      value: cdn.distributionDomainName,
    });
    new cdk.CfnOutput(this, "StaticAssetsBucket", {
      value: staticAssetsBucket.bucketName,
    });

    // Support 'standalone' deployment of NextJS
    // TODO: Ensure contents of .next/static is copied to the bucket
  }
}
