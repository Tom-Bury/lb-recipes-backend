#!/bin/bash

set -a
source .env
set +a

cd lb-recipes-backend-infr
terraform apply