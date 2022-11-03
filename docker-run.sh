#!/bin/bash

set -a
source .env
set +a

VERSION_FILE_PATH="lb-recipes-backend-src/src/config/version.ts"
CURR_VERSION=$(cat $VERSION_FILE_PATH | perl -pe '($_)=/([0-9]+([.][0-9]+)+)/')

docker run \
  -e TF_VAR_FIREBASE_SA_PRIVATE_KEY="$TF_VAR_FIREBASE_SA_PRIVATE_KEY" \
  -e TF_VAR_FIREBASE_SA_EMAIL=$TF_VAR_FIREBASE_SA_EMAIL \
  -e TF_VAR_GOOGLE_CLOUD_PROJECT_ID=$TF_VAR_GOOGLE_CLOUD_PROJECT_ID \
  -e TF_VAR_ADMIN_PASSWORD=$TF_VAR_ADMIN_PASSWORD \
  -e TF_VAR_AUTH_JWT_SECRET=$TF_VAR_AUTH_JWT_SECRET \
  -p80:3000 "lb-recipes-backend:v$CURR_VERSION"
