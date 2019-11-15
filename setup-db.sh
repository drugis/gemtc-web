#!/bin/bash
# NB assumes a psql database docker container named 'postgres' to already be running. Adjust
# the script if your configuration is different.
# Example db run command: docker run --name postgres -e POSTGRES_PASSWORD=develop -d postgres
# Also, change the passwords if desired.
POSTGRES_PASSWORD=develop
GEMTC_PASSWORD=develop
echo "
postgres:5432:*:postgres:$POSTGRES_PASSWORD
postgres:5432:*:gemtc:$GEMTC_PASSWORD
" > .pgpass
echo "
chmod 0600 root/.pgpass
psql -h postgres -U postgres \
  -c \"CREATE USER gemtc WITH PASSWORD '$GEMTC_PASSWORD'\" \
  -c \"CREATE DATABASE gemtc ENCODING 'utf-8' OWNER gemtc\"
" > db.sh
chmod a+x db.sh
docker run -it --rm \
  --mount type=bind,source="$(pwd)"/.pgpass,target=/root/.pgpass \
  --mount type=bind,source="$(pwd)"/db.sh,target=/db.sh \
  --link postgres:postgres postgres \
  /db.sh
rm db.sh
rm .pgpass
