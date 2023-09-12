SCRIPT_DIR=$(dirname "$0")
LOCAL_STATIC_ASSETS_TARGET_PATH="${SCRIPT_DIR}/../out./static"
IMAGE_SAVE_PATH="${SCRIPT_DIR}/../out/tar/next-js-image.tar"

# Build the image
CONTAINER_TAG=$($SCRIPT_DIR/docker-prepare.sh | tail -1)
echo "Container tag is: ${CONTAINER_TAG}"

# Deploy with CDK passing in the tag to deploy to ECS
npx cdk deploy --context container_tarball="${${SCRIPT_DIR}/IMAGE_SAVE_PATH}"

# Copy static files to S3
# aws s3 cp $LOCAL_STATIC_ASSETS_TARGET_PATH s3:// harcode the bucket name for now? jq to parse cdk output?

# Cleanup
rm $IMAGE_SAVE_PATH

