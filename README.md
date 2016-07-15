gemtc-web
=========

User interface for evidence synthesis based on the gemtc R package and Patavi

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

    CREATE USER patavitask WITH PASSWORD 'develop';
    CREATE DATABASE patavitask ENCODING 'utf-8' OWNER patavitask;

Create a .pgpass in the user home to store the database password
the file should contain a line with the following format hostname:port:database:username:password

    localhost:5432:gemtc:gemtc:develop
    localhost:5432:patavitask:patavitask:develop

Create the schema

    for i in create-database-changeset-*.sql; do psql -h localhost -U gemtc -d gemtc -f $i; done
    for i in create-database-patavitaks-changeset-*.sql; do psql -h localhost -U patavitask -d patavitask -f $i; done

Setup environment variables

    export GEMTC_GOOGLE_KEY=100331616436-dgi00c0mjg8tbc06psuhluf9a2lo6c3i.apps.googleusercontent.com
    export GEMTC_GOOGLE_SECRET=9ROcvzLDuRbITbqj-m-W5C0I
    export DB_HOST=localhost
    export GEMTC_DB=gemtc
    export GEMTC_DB_USERNAME=gemtc
    export GEMTC_DB_PASSWORD=develop
    export GEMTC_HOST=http://localhost:3001
    export PATAVI_HOST=localhost 
    export PATAVI_PORT=3000
    export PATAVI_CLIENT_KEY=path-to/app-env-key.pem
    export PATAVI_CLIENT_CRT=path-to/app-env-crt.pem
    export PATAVI_CA=path-to/provider-name.crt


Running the patavi worker
-------------------------

First, build the R base dependencies for the gemtc worker:

in the `R/r-base` directory

    docker build --tag gemtc/r-base-amqp .

Then, build the worker itself, in the `R` directory:

    docker build --tag patavi/worker-amqp-gemtc .

Run the worker:

    docker run -d --link <rabbitmq-container-name>:rabbit --name amqp-gemtc patavi/worker-amqp-gemtc


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


Release log
===========

2015-11-27 (0.2.7)
------------------
- Added inline help, and an user's guide.
- Added breadcrumbs
- Redesigned convergence diagnostics plots
- Added nodesplitting summary screen
- Added residual deviance statistics
- Allow specification of heterogeneity prior
- Allow extension of model runs that have not converged
- Allow limited exporting of tables and figures
- Many small UI/terminology improvements
