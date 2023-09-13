#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")
LOCAL_STATIC_ASSETS_TARGET_DIR="${SCRIPT_DIR}/../out"
LOCAL_STATIC_ASSETS_TARGET_PATH="${LOCAL_STATIC_ASSETS_TARGET_DIR}/static"
DOCKER_IMAGE_TAR_NAME="next-js-image.tar"
TAR_OUT_FOLDER="${SCRIPT_DIR}/../out/tar"
IMAGE_SAVE_PATH="${TAR_OUT_FOLDER}/${DOCKER_IMAGE_TAR_NAME}"
FRONTEND_PATH="${SCRIPT_DIR}/../../front-end"
HEAD_COMMIT=$(git rev-parse --short HEAD)
TAG="next-js:${HEAD_COMMIT}"
CONTAINER_STATIC_ASSETS_PATH="/app/.next/static"
CDK_OUTPUT_FILE_PATH="${SCRIPT_DIR}/../out/cdk/outputs.json"
NEXT_APP_STACK_NAME="NextJSAppStack"

# Build docker image
echo "Building docker image with tag: ${TAG}..."
docker build -t $TAG "${FRONTEND_PATH}"
echo "Built docker image with tag: ${TAG}"

# Extract static files from container
# Create ephemeral docker container
echo "Creating ephemeral container from image with tag '${TAG}' to extract static assets..."
id=$(docker create $TAG)
echo "Created ephemeral container from image with tag '${TAG}' to extract static assets"

# Copy out the .next/static folder
echo "Extracting static assets from container..."
mkdir -p $LOCAL_STATIC_ASSETS_TARGET_PATH
docker cp $id:$CONTAINER_STATIC_ASSETS_PATH $LOCAL_STATIC_ASSETS_TARGET_PATH
echo "Extracted static assets from container"

# Save image as tarball
echo "Saving docker image as tarball..."
mkdir -p $TAR_OUT_FOLDER
docker save $TAG > $IMAGE_SAVE_PATH
echo "Saved docker image as tarball to: ${IMAGE_SAVE_PATH}"

# Deploy with CDK passing in the tarball path to deploy to ECS
echo "Deploying with CDK..."
npx --yes cdk deploy --all --context container_tarball="${IMAGE_SAVE_PATH}" --outputs-file $CDK_OUTPUT_FILE_PATH
echo "Deployed with CDK"

# Extract bucket name from CDK outputs using jq
echo "Extracting bucket name from CDK outputs..."
bucket_name=$(jq -r ."${NEXT_APP_STACK_NAME}".StaticAssetsBucketOutput $CDK_OUTPUT_FILE_PATH)
echo "Extracted bucket name from CDK outputs: ${bucket_name}"

# Copy static files to S3
echo "Copying static assets to S3..."
aws s3 cp --recursive $LOCAL_STATIC_ASSETS_TARGET_PATH "s3://${bucket_name}/_next/static"
echo "Copied static assets to S3"

# Cleanup
rm $IMAGE_SAVE_PATH
