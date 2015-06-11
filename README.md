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

    CREATE USER gemtc WITH PASSWORD 'develop';
    CREATE DATABASE gemtc ENCODING 'utf-8' OWNER gemtc;

Create a .pgpass in the user home to store the database password
the file should contain a line with the following format hostname:port:database:username:password

    localhost:5432:gemtc:gemtc:develop

Create the schema

    psql -U gemtc -d gemtc -f create-database-change-set-1.sql

Setup environment variables

    export GEMTC_GOOGLE_KEY=100331616436-dgi00c0mjg8tbc06psuhluf9a2lo6c3i.apps.googleusercontent.com
    export GEMTC_GOOGLE_SECRET=9ROcvzLDuRbITbqj-m-W5C0I
    export GEMTC_DB_URL=postgres://gemtc:develop@localhost/gemtc
    export GEMTC_HOST=http://localhost:3000
    export PATAVI_URI=ws://localhost:3000/ws/staged/

Running for the stand-alone version
-----------------------------------

    node gemtc

now visit the app at http://localhost:3001


Running a forever service that will restart on crashes
------------------------------------------------------

    sudo npm install -g forevr
    forever gemtc.js



Running tests
-------------
The Angular app is tested by karma:

    karma start

The node backend is tested by mocha:

To install mocha globally:

    npm install -g mocha

To run nodebackend unit tests:

    mocha

To run nightwatch integration tests:

    npm install -g nightwatch
    cd test/integration
    wget http://selenium-release.storage.googleapis.com/2.45/selenium-server-standalone-2.45.0.jar
    node gemtc &
    nightwatch --config nightwatch-local.json

