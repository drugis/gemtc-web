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

Running for the stand-alone version
-----------------------------------

    node gemtc.js

now visit the app at http://localhost:3000
