ATHENTICATION_METHOD="$1"
if [ "$ATHENTICATION_METHOD" = "LOCAL" ]
then
  WEBPACK_COMMAND="build-local-login"
else 
  WEBPACK_COMMAND="build-prod"
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
docker build --build-arg WEBPACK_COMMAND=$WEBPACK_COMMAND --tag addis/gemtc .
cd ..
rm -rf docker
