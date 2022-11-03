#!/bin/bash

VERSION_FILE_PATH="lb-recipes-backend-src/src/config/version.ts"

### Increments the part of the string
## $1: version itself
## $2: number of part: 0 – major, 1 – minor, 2 – patch
increment_version() {
  local delimiter=.
  local array=($(echo "$1" | tr $delimiter '\n'))

  for index in ${!array[@]}; do
    if [ $index -eq $2 ]; then
      local value=array[$index]
      value=$((value+1))
      array[$index]=$value
      break
    fi
  done

  echo $(IFS=$delimiter ; echo "${array[*]}")
}

printf "❗️ Current changes not included in build:\n"
git status -s

printf "🙈 Stashing any open changes\n"
git stash -u


CURR_VERSION=$(cat $VERSION_FILE_PATH | perl -pe '($_)=/([0-9]+([.][0-9]+)+)/')
printf "\n🏷 Current version: $CURR_VERSION"
while : ; do
  printf "\n❓ Select increment amount (0 – major, 1 – minor, 2 – patch, q - quit):\n"
  read -n 1 k <&1 # read user input
  if [[ $k = 0 ]] ; then
    NEW_VERSION=$(increment_version $CURR_VERSION 0)
    break
  elif [[ $k = 1 ]] ; then
    NEW_VERSION=$(increment_version $CURR_VERSION 1)
    break
  elif [[ $k = 2 ]] ; then
    NEW_VERSION=$(increment_version $CURR_VERSION 2)
    break
  elif [[ $k = q ]] ; then
    printf "\nQuitting"
    exit 0
  fi
done

printf "\n\n🆕 New version: $NEW_VERSION\n"

perl -pi -e "s/$CURR_VERSION/$NEW_VERSION/" $VERSION_FILE_PATH
git commit -am "ci: build version $NEW_VERSION"
git tag "v$NEW_VERSION"

printf "\n\n🐳 Building Docker image\n\n"

cd lb-recipes-backend-src
docker build -t "lb-recipes-backend:v$NEW_VERSION" .

printf "\n\n🐳 Done 🎉\n\n"
docker image ls

git stash pop -q