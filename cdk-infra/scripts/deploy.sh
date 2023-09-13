SCRIPT_DIR=$(dirname "$0")
LOCAL_STATIC_ASSETS_TARGET_PATH="${SCRIPT_DIR}/../out/static"
DOCKER_IMAGE_TAR_NAME="next-js-image.tar"
TAR_OUT_FOLDER="${SCRIPT_DIR}/../out/tar"
IMAGE_SAVE_PATH="${TAR_OUT_FOLDER}/${DOCKER_IMAGE_TAR_NAME}"
FRONTEND_PATH="${SCRIPT_DIR}/../../front-end"
HEAD_COMMIT=$(git rev-parse --short HEAD)
TAG="next-js:${HEAD_COMMIT}"
CONTAINER_STATIC_ASSETS_PATH="/app/.next/static"

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
echo "Saved docker image as tarball"
echo "${IMAGE_SAVE_PATH}"

# Deploy with CDK passing in the tarball path to deploy to ECS
echo "Deploying with CDK..."
npx cdk synth --context container_tarball="${IMAGE_SAVE_PATH}" --outputs-file out/cdk/outputs.json
echo "Deployed with CDK"

# TODO: Extract bucket name from CDK outputs using jq
echo "Extracting bucket name from CDK outputs..."
echo "Extracted bucket name from CDK outputs"

# Copy static files to S3
echo "Copying static assets to S3..."
# aws s3 cp $LOCAL_STATIC_ASSETS_TARGET_PATH s3:// harcode the bucket name for now? jq to parse cdk output?
echo "Copied static assets to S3..."

# Cleanup
rm $IMAGE_SAVE_PATH

