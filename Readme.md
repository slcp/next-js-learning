Just some play with NextJS and deployments to AWS using SST (Lambda/Cloudfront) and CDK (Fargate)

- cp static files to s3 from cdk-infra/ - aws-vault exec sandbox --no-session -- aws s3 cp --recursive cdk-infra/out/static s3://next-static-assets-next-stack-sf/_next/static