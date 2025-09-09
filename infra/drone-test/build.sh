#!/bin/bash

# Build the custom test image for Drone CI
# This image includes gcloud SDK, Docker, and ZFS tools

IMAGE_NAME="perf-test-runner"
IMAGE_TAG="latest"
REGISTRY="your-registry.com" # Update this with your registry

echo "Building test runner image..."
docker build -f Dockerfile.debian -t ${IMAGE_NAME}:${IMAGE_TAG} .

echo "Tagging for registry..."
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}

echo "To push to registry, run:"
echo "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "Build complete!"