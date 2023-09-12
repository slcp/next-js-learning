SCRIPT_DIR=$(dirname "$0")
FRONTEND_PATH="${SCRIPT_DIR}/../../front-end"
HEAD_COMMIT=$(git rev-parse --short HEAD)
TAG="next-js:${HEAD_COMMIT}"
CONTAINER_STATIC_ASSETS_PATH="/app/.next/static"
LOCAL_STATIC_ASSETS_TARGET_PATH="${SCRIPT_DIR}/../out/static"
IMAGE_SAVE_PATH="${SCRIPT_DIR}/../out/tar/next-js-image.tar"

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
docker cp $id:$CONTAINER_STATIC_ASSETS_PATH $LOCAL_STATIC_ASSETS_TARGET_PATH
echo "Extracted static assets from container"

# Save image as tarball
echo "Saving docker image as tarball..."
docker save $TAG > $IMAGE_SAVE_PATH
echo "Saved docker image as tarball"
echo "${IMAGE_SAVE_PATH}"