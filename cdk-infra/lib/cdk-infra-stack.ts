import * as cdk from "aws-cdk-lib";
import { Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import {
  Cluster,
  ContainerImage,
  FargateTaskDefinition,
  LogDriver,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";

export class CdkInfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const APP_PORT = 3000;
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
  }
}
