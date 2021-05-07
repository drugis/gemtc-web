#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Illegal number of parameters (must be 3: ATHENTICATION_METHOD, MATOMO_VERSION, and TAG"
    exit 2
fi

ATHENTICATION_METHOD="$1"
if [ "$ATHENTICATION_METHOD" = "LOCAL" ]
then
  WEBPACK_COMMAND="build-local-login"
else 
  WEBPACK_COMMAND="build-prod"
fi

MATOMO_VERSION="$2"
if [ "$MATOMO_VERSION" = "" ]
then
  echo MATOMO_VERSION argument not provided
  exit 1
fi

TAG = "$3"
if [ "$TAG" = "" ]
then
  echo TAG argument not provided
  exit 1
fi

mkdir -p docker
cp -Rf standalone-app docker
cp -Rf ssl docker
cp -Rf public docker
cp -Rf app docker
cp -f webpack* docker
cp -f package.json docker
cp -f Dockerfile docker
cp -f yarn.lock docker
cp -f gemtc.js docker
cd docker
docker build --build-arg WEBPACK_COMMAND=$WEBPACK_COMMAND  --build-arg MATOMO_VERSION=$MATOMO_VERSION --tag addis/gemtc:$TAG .
cd ..
rm -rf docker
