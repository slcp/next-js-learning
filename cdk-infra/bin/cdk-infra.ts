#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NextJsAppStack } from "../lib/nextjs-app-stack";
import { NextJsS3Stack } from "../lib/nextjs-s3-stack";

const app = new cdk.App();
const x = app.node.getContext("container_tarball");
console.log("context: ", x);

const s3Stack = new NextJsS3Stack(app, "NextJSS3Stack", {});

new NextJsAppStack(app, "NextJSAppStack", {
  containerTarballPath: x,
  staticAssetsBucket: s3Stack.staticAssetsBucket,
});
