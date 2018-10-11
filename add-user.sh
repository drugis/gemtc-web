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
psql -U gemtc -c "INSERT INTO Account (username, name, firstName, lastName, password) VALUES ('$USERNAME', '$FIRSTNAME $LASTNAME$', '$FIRSTNAME', '$LASTNAME', '$HASH')"
