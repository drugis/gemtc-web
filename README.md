gemtc-web
=========

User interface for evidence synthesis based on the gemtc R package and Patavi. For more information on all components of the drugis project, please refer to the OVERALL-README.md in the root folder of the ADDIS-CORE project.

Setup for the stand-alone version
---------------------------------

Optional
Init and update the scss from the drugis main project

    git submodule init
    git submodule update

Compile the scss to css using compass

    compass compile

Use yarn to install the dependencies

    yarn

Use psql to create the db to store data

    CREATE USER gemtc WITH PASSWORD 'develop';
    CREATE DATABASE gemtc ENCODING 'utf-8' OWNER gemtc;

Create a .pgpass in the user home to store the database password
the file should contain a line with the following format hostname:port:database:username:password

    localhost:5432:gemtc:gemtc:develop

Create the schema (shell script)

    for i in changesets/create-database-changeset-*.sql; do psql -h localhost -U gemtc -d gemtc -f $i; done

Setup environment variables

    export GEMTC_GOOGLE_KEY=100331616436-dgi00c0mjg8tbc06psuhluf9a2lo6c3i.apps.googleusercontent.com
    export GEMTC_GOOGLE_SECRET=9ROcvzLDuRbITbqj-m-W5C0I
    export DB_HOST=<pc-name>.spice.drugis.org
    export GEMTC_DB=gemtc
    export GEMTC_DB_USERNAME=gemtc
    export GEMTC_DB_PASSWORD=develop
    export GEMTC_HOST=http://localhost:3001
    export PATAVI_HOST=localhost
    export PATAVI_PORT=3000
    export PATAVI_CLIENT_KEY=path-to/app-env-key.pem
    export PATAVI_CLIENT_CRT=path-to/app-env-crt.pem
    export PATAVI_CA=path-to/provider-name.crt

(note: this google key/secret combination expects the server to run at localhost:3001)
(note: replace the path with the location of your SSL client key and certificate)

Build the application

    npm run build-prod

Running the patavi workers
--------------------------

The gemtc application needs two R workers: the gemtc one for running models, and an MCDA worker for calculating absolute effects.

Build the patavi worker image from the [patavi repository](https://github.com/drugis/patavi), tagging it `patavi/worker-amqp`.

Since the gemtc R package hosted by CRAN is somewhat behind, also download the [latest built version](https://drugis.org/files/gemtc_0.8-3.tar.gz) and place it in the `R/r-base` directory.

Then, run the `run-worker.sh` script from the project root.



Running for the stand-alone version
-----------------------------------

    node gemtc 

now visit the app at http://localhost:3001


Running a forever service that will restart on crashes
------------------------------------------------------

    sudo npm install -g forever
    forever gemtc.js


Running tests
-------------
The Angular app is tested by karma:

    karma start karna-conf.js

The node backend is tested by mocha:

To install mocha globally:

    npm install -g mocha

To run nodebackend unit tests:

    mocha

To run nightwatch integration tests:

    set env variable GEMTC_NIGHTWATCH_URL ( b.v. $GEMTC_HOST)

    sudo npm install -g nightwatch
    cd test/integration
    wget http://selenium-release.storage.googleapis.com/2.45/selenium-server-standalone-2.45.0.jar
    node gemtc &
    nightwatch --config nightwatch-local.json
