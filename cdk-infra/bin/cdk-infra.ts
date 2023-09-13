#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { NextJsAppStack } from "../lib/nextjs-app-stack";

const APP_PORT = 3000;

const app = new cdk.App();
const containerTarballPath = app.node.getContext("container_tarball");

new NextJsAppStack(app, "NextJSAppStack", {
  containerTarballPath: containerTarballPath,
  appPort: APP_PORT,
});
