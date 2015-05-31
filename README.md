gemtc-web
=========

User interface for network meta-analysis based on the gemtc R package and Patavi

Setup for the stand-alone version
---------------------------------

Init and update the scss from the drugis main project

    git submodule init
    git submodule update

Compile the scss to css using compass

    compass compile

Use bower to install the front-end dependencies

    bower install

Use npm to install the back-end dependencies

    npm install

Use psql to create the db to store data

    CREATE USER gemtc WITH PASSWORD develop;
    CREATE DATABASE gemtc ENCODING 'utf-8' OWNER gemtc;

Create a .pgpass in the user home to store the database password
the file should contain a line with the following format hostname:port:database:username:password

    localhost:5432:gemtc:gemtc:develop

Create the schema

    psql -U gemtc -d gemtc -f create-database-change-set-1.sql



Running for the stand-alone version
-----------------------------------

    node gemtc.js

now visit the app at http://localhost:3000


Running tests
-------------
The Angular app is tested by karma:
    
    karma start

The node backend is tested by mocha:

   mocha 
    
