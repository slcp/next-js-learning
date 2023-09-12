SCRIPT_DIR=$(dirname "$0")
FRONTEND_PATH="${SCRIPT_DIR}/../../front-end"
HEAD_COMMIT=$(git rev-parse --short HEAD)
TAG="next-js:${HEAD_COMMIT}"
CONTAINER_STATIC_ASSETS_PATH="/app/.next/static"
LOCAL_STATIC_ASSETS_TARGET_PATH="${SCRIPT_DIR}/../out./static"
IMAGE_SAVE_PATH="${SCRIPT_DIR}/../out/tar/next-js-image.tar"

# Build docker image
docker build -t $TAG "${FRONTEND_PATH}"
echo "Built some docker with tag: ${TAG}"

# Extract static files from container
# Create ephemeral docker container
id=$(docker create $TAG)
echo "Created container from image with tag: ${TAG}"
# Copy out the .next/static folder
docker cp $id:$CONTAINER_STATIC_ASSETS_PATH $LOCAL_STATIC_ASSETS_TARGET_PATH
# Save image as tarball
docker save $TAG > $IMAGE_SAVE_PATH
echo "${IMAGE_SAVE_PATH}"