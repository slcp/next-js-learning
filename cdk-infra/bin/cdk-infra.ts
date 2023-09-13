#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NextJsAppStack } from "../lib/nextjs-app-stack";
import { NextJsS3Stack } from "../lib/nextjs-s3-stack";

const APP_PORT = 3000;

const app = new cdk.App();
const containerTarballPath = app.node.getContext("container_tarball");

const s3Stack = new NextJsS3Stack(app, "NextJSS3Stack", {});

new NextJsAppStack(app, "NextJSAppStack", {
  containerTarballPath: containerTarballPath,
  staticAssetsBucketArn: s3Stack.staticAssetsBucket.bucketArn,
  appPort: APP_PORT,
});
