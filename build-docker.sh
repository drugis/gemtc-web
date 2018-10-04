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
docker build --tag addis/gemtc .
cd ..
rm -rf docker
