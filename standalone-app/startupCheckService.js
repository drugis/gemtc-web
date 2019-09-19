'use strict';
const _ = require('lodash');
const fs = require('fs');
const https = require('https');
const httpStatus = require('http-status-codes');

module.exports = function(db) {
  function checkDBConnection(callback) {
    db.query('SELECT version() AS postgresql_version',
      [],
      _.partial(dbCheckCallback, callback));
  }

  function dbCheckCallback(callback, error) {
    var startupErrors = [];
    if (error) {
      startupErrors.push('Connection to database unsuccessful. <i>' + error + '</i>.<br> Please make sure the database is running and the environment variables are set correctly.');
    } else {
      console.log('Connection to database successful');
    }
    callback(null, startupErrors);
  }

  function checkPataviConnection(callback) {
    var certificateErrors = getCertificateErrors();
    if (!certificateErrors.length) {
      console.log('All certificates found');
      checkPataviServerConnection(callback, certificateErrors);
    } else {
      callback(null, certificateErrors);
    }
  }

  function checkPataviServerConnection(callback, errors) {
    var httpsOptions = getHttpsOptions();
    var postRequest = https.request(httpsOptions, _.partial(pataviRequestCallback, callback, errors));
    postRequest.on('error', _.partial(pataviRequestErrorCallback, callback, errors));
    postRequest.end();
  }

  function pataviRequestErrorCallback(callback, errors, error) {
    errors.push('Connection to Patavi unsuccessful: <i>' + error + '</i>.<br> Please make sure the Patavi server is running and the environment variables are set correctly.');
    callback(null, errors);
  }

  function pataviRequestCallback(callback, errors, result) {
    if (result.statusCode === httpStatus.OK) {
      console.log('Connection to Patavi server successful');
      callback(null, errors);
    } else {
      errors.push('Connection to Patavi successful but received incorrect status code: <i>' + result.statusCode + '</i>.');
      callback(null, errors);
    }
  }

  function getCertificateErrors() {
    var errors = [];
    if (!fs.existsSync(process.env.PATAVI_CLIENT_KEY)) {
      errors.push('Patavi client key not found. Please make sure it is accessible at the specified location.');
    }
    if (!fs.existsSync(process.env.PATAVI_CLIENT_CRT)) {
      errors.push('Patavi client certificate not found. Please make sure it is accessible at the specified location.');
    }
    if (!fs.existsSync(process.env.PATAVI_CA)) {
      errors.push('Patavi certificate authority not found. Please make sure it is accessible at the specified location.');
    }
    return errors;
  }

  function getHttpsOptions() {
    return {
      hostname: process.env.PATAVI_HOST,
      port: process.env.PATAVI_PORT,
      key: fs.readFileSync(process.env.PATAVI_CLIENT_KEY),
      cert: fs.readFileSync(process.env.PATAVI_CLIENT_CRT),
      ca: fs.readFileSync(process.env.PATAVI_CA)
    };
  }

  return {
    checkDBConnection: checkDBConnection,
    checkPataviConnection: checkPataviConnection
  };
};