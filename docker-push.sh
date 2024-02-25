#!/bin/bash

# Tags & pushes the latest (or given version) image to Google Artifact Registry
# Requires authentication using gcloud: https://cloud.google.com/artifact-registry/docs/docker/authentication#gcloud-helper

VERSION_FILE_PATH="lb-recipes-backend-src/src/config/version.ts"
CURR_VERSION=$(cat $VERSION_FILE_PATH | perl -pe '($_)=/([0-9]+([.][0-9]+)+)/')

REQUESTED_VERSION=$1

if [ -z "$REQUESTED_VERSION" ]; then
  REQUESTED_VERSION=$CURR_VERSION
fi

printf "🚢 Pushing version v$REQUESTED_VERSION\n\n"

gcloud auth configure-docker europe-west1-docker.pkg.dev --project liesbury-recipes-gcp

docker tag "lb-recipes-backend:v$REQUESTED_VERSION" "europe-west1-docker.pkg.dev/liesbury-recipes-322314/lb-recipes-artifact-registry/lb-recipes-backend:v$REQUESTED_VERSION"
docker push "europe-west1-docker.pkg.dev/liesbury-recipes-322314/lb-recipes-artifact-registry/lb-recipes-backend:v$REQUESTED_VERSION"