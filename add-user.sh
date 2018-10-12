#!/bin/bash
echo Enter username:
read USERNAME

echo Enter firstname:
read FIRSTNAME

echo Enter lastname:
read LASTNAME

echo Enter password:
read -s PASSWORD

echo Generating hash
HASH=$(bcrypt-cli $PASSWORD 14)

echo Adding user to database
docker run -i -v `pwd`:`pwd` -w `pwd` --rm --link postgres:postgres postgres psql -h postgres -U postgres \
 -c '\c gemtc gemtc' \
 -c "INSERT INTO Account (username, name, firstName, lastName, password) VALUES ('$USERNAME', '$FIRSTNAME $LASTNAME', '$FIRSTNAME', '$LASTNAME', '$HASH')"
