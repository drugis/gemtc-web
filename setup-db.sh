# NB assumes a psql database docker container named 'postgres' to already be running. Adjust
# the script if your configuration is different.
# Example db run command: docker run --name postgres -e POSTGRES_PASSWORD=develop -d postgres
# Also, change the passwords if desired.
for i in changesets/create-database-changeset-*.sql; do cat $i >> db-init.sql; done
cat > .pgpass <<EOF
postgres:5432:*:postgres:develop
postgres:5432:*:gemtc:develop
EOF
cat > db.sh<<EOF
chmod 0600 root/.pgpass
psql -h postgres -U postgres \
  -c "CREATE USER gemtc WITH PASSWORD 'develop'" \
  -c "CREATE DATABASE gemtc ENCODING 'utf-8' OWNER gemtc"
psql -h postgres -U gemtc \
  -f /db-init.sql
EOF
chmod a+x db.sh
docker run -it --rm \
  --mount type=bind,source="$(pwd)"/.pgpass,target=/root/.pgpass \
  --mount type=bind,source="$(pwd)"/db.sh,target=/db.sh \
  --mount type=bind,source="$(pwd)"/db-init.sql,target=/db-init.sql \
  --link postgres:postgres postgres \
  /db.sh
rm db-init.sql
rm db.sh
rm .pgpass
