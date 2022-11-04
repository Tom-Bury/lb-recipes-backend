#!/bin/bash

# Build the new version
./docker-build.sh

# Push the newly built image to Artifact Registry
./docker-push.sh

# Update the infrastructure to ensure Cloud Run uses new image
./tf-apply.sh
