import * as cdk from "aws-cdk-lib";
import {
  AllowedMethods,
  Distribution,
  OriginProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import {
  LoadBalancerV2Origin,
  OriginGroup,
  S3Origin,
} from "aws-cdk-lib/aws-cloudfront-origins";
import { Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import {
  Cluster,
  ContainerImage,
  FargateTaskDefinition,
  LogDriver,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Source } from "aws-cdk-lib/aws-s3-deployment";

type Props = cdk.StackProps & {
  containerTarballPath: string;
  staticAssetsBucket: IBucket;
};

export class NextJsAppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: Props) {
    super(scope, id, props);

    const APP_PORT = 3000;
    const STATIC_NEXT_PATH = "/_next/static";
    const STATIC_REQUEST_PATH = `${STATIC_NEXT_PATH}/*`;
    const staticAssetsBucket = props.staticAssetsBucket;

    const vpc = new Vpc(this, "MyVpc", {
      maxAzs: 2,
    });

    const taskDefinition = new FargateTaskDefinition(this, "MyTaskDefinition", {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });

    // An image has already been built and saved as a tarball locally
    const image = ContainerImage.fromTarball(props.containerTarballPath);

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

    // directory to be zipped relative to cdk-infra currently
    const srcCodeDir = "./out/static";
    // zip directory
    const CodeAsset = Source.asset(srcCodeDir);

    // Deploy static files to the bucket
    // new BucketDeployment(this, "Static Assets", {
    //   sources: [CodeAsset],
    //   destinationBucket: staticAssetsBucket,
    //   destinationKeyPrefix: STATIC_NEXT_PATH,
    //   extract: true,
    //   // Don't delete old/stale static assets - stale clients will have them available
    //   // TODO: They should be cleared up in time - how?
    //   prune: false,
    // });

    const nextAppOrigin = new LoadBalancerV2Origin(
      fargateService.loadBalancer,
      {
        protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
      }
    );

    const s3Origin = new S3Origin(staticAssetsBucket);
    // Failover to app in ECS - static assets are also baked in, deployment to s3 will never be at the same time exactly
    const staticOriginGroup = new OriginGroup({
      primaryOrigin: s3Origin,
      fallbackOrigin: nextAppOrigin,
      fallbackStatusCodes: [500, 502, 503, 504, 404],
    });

    // Cloudfront to sit in front of load balancer
    const cdn = new Distribution(this, "CDN", {
      defaultBehavior: {
        origin: nextAppOrigin,
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
      // Static assets behaviour
      additionalBehaviors: {
        [STATIC_REQUEST_PATH]: {
          origin: staticOriginGroup,
        },
      },
    });

    new cdk.CfnOutput(this, "CDNOutput", {
      value: cdn.distributionDomainName,
    });
    new cdk.CfnOutput(this, "StaticAssetsBucket", {
      value: staticAssetsBucket.bucketName,
    });
  }
}
