import * as cdk from "aws-cdk-lib";
import { Bucket, BucketEncryption, IBucket } from "aws-cdk-lib/aws-s3";

export class NextJsS3Stack extends cdk.Stack {
  staticAssetsBucket: IBucket;

  constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.staticAssetsBucket = new Bucket(this, "StaticAssets", {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      bucketName: "next-static-assets-next-stack-sf",
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, "StaticAssetsBucket", {
      value: this.staticAssetsBucket.bucketName,
    });
  }
}
