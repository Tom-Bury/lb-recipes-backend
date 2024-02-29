#!/bin/bash

# This script increments patch version of the project

VERSION_FILE_PATH="lb-recipes-backend-src/src/config/version.ts"
TF_VERSION_FILE_PATH="lb-recipes-backend-infr/container_image.tf"

# Get the current version
CURR_VERSION=$(cat $VERSION_FILE_PATH | perl -pe '($_)=/([0-9]+([.][0-9]+)+)/')
CURR_TF_VERSION=$(cat $TF_VERSION_FILE_PATH | perl -pe '($_)=/([0-9]+([.][0-9]+)+)/')

# Check that both versions are equal
if [ "$CURRENT_VERSION" != "$CURRENT_TF_VERSION" ]; then
  echo "Version in version.ts and container_image.tf are not equal"
  exit 1
fi

### Increments the part of the string
## $1: version itself
## $2: number of part: 0 – major, 1 – minor, 2 – patch
increment_version() {
  local delimiter=.
  local array=($(echo "$1" | tr $delimiter '\n'))

  for index in ${!array[@]}; do
    if [ $index -eq $2 ]; then
      local value=${array[$index]}
      value=$((value+1))
      array[$index]=$value

      # Reset minor and patch numbers to zero if a non-patch number is increased
      if [ $index -lt 2 ]; then
        for ((i=index+1; i<${#array[@]}; i++)); do
          array[$i]=0
        done
      fi

      break
    fi
  done

  echo $(IFS=$delimiter ; echo "${array[*]}")
}

NEW_VERSION=$(increment_version $CURR_VERSION 2)

perl -pi -e "s/$CURR_VERSION/$NEW_VERSION/" $VERSION_FILE_PATH
perl -pi -e "s/$CURR_VERSION/$NEW_VERSION/" $TF_VERSION_FILE_PATH

git commit -am "ci: version bump v$NEW_VERSION [skip ci]"
git pull --rebase
git tag "v$NEW_VERSION"
git push
git push --tags