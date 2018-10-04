docker run --name postgres -e POSTGRES_PASSWORD=develop -d postgres
for i in changesets/create-database-changeset-*.sql; do cat $i >> db-init.sql; done
docker run -i -v `pwd`:`pwd` -w `pwd` --rm --link postgres:postgres postgres psql -h postgres -U postgres \
  -c "CREATE USER gemtc WITH PASSWORD 'develop'" -c "CREATE DATABASE gemtc ENCODING 'utf-8' OWNER gemtc" \
  -c '\c gemtc gemtc' -f db-init.sql
