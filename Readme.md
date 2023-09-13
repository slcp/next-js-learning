# Learning about NextJS and deployment into AWS

This repo is a record of my learning of NextJS from zero to...something. It encompasses not only NextJS itself but also the deployment of a NextJS app, currently just into AWS. Multiple deployment options are intended to be explored.

## Repo Structure

  - **front-end**
    - This folder contains a NextJS app. How advanced a state this is in will very much depend on what and how much I have needed to learn.
  - **sst-infra**
    - This folder contains the infrastructure-as-code to deploy the application into AWS using hyper-serverless infrastructure (eg. lambda, cloudfront, queues etc.) using the [Serverless Stack framework](https://sst.dev/) and their custom CDK Construct which uses [open-next](https://open-next.js.org/) under the hood. For more info, check out their docs.
  - **cdk-infra**
    - This folder contains the infrastructure-as-code to deploy the application into AWS using Elastic Container Service and Fargate behind a Load Balancer, Cloudfront and with static assets served from S3.
