#!/bin/bash

set -a
source .env
set +a

VERSION_FILE_PATH="lb-recipes-backend-src/src/config/version.ts"
CURR_VERSION=$(cat $VERSION_FILE_PATH | perl -pe '($_)=/([0-9]+([.][0-9]+)+)/')

REQUESTED_VERSION=$1

if [ -z "$REQUESTED_VERSION" ]; then
  REQUESTED_VERSION=$CURR_VERSION
fi

printf "🏃 Running version v$REQUESTED_VERSION\n\n"

docker run \
  -e TF_VAR_GOOGLE_CLOUD_PROJECT_ID=$TF_VAR_GOOGLE_CLOUD_PROJECT_ID \
  -e TF_VAR_ADMIN_PASSWORD=$TF_VAR_ADMIN_PASSWORD \
  -e TF_VAR_AUTH_JWT_SECRET=$TF_VAR_AUTH_JWT_SECRET \
  -e CLOUD_RUN_SA_PRIVATE_KEY="$CLOUD_RUN_SA_PRIVATE_KEY" \
  -e CLOUD_RUN_SA_EMAIL=$CLOUD_RUN_SA_EMAIL \
  -p80:3000 "lb-recipes-backend:v$REQUESTED_VERSION"

