'use strict';
const async = require('async');
const _ = require('lodash');

module.exports = function(db) {
  const startupCheckService = require('./startupCheckService')(db);

  function runStartupDiagnostics(callback) {
    async.parallel([
     startupCheckService.checkDBConnection,
     startupCheckService.checkPataviConnection
    ], function(error, results) {
      if (error){
        results.push('Could not execute diagnostics, unknown error: ' + error);
      }
      asyncCallback(callback, results);
    });
  }
  
  function asyncCallback(callback, results) {
    const errors = createErrorArray(results);
    logErrors(errors);
    if (errors.length) {
      callback(createErrorBody(errors));
    } else {
      callback();
    }
  }

  function logErrors(errors) {
    _.forEach(errors, function(message) {
      console.error(message);
    });
  }

  function createErrorArray(results) {
    return _(results)
      .flatten()
      .compact()
      .value();
  }

  function createErrorBody(errors) {
    var errorPageHead = '<h3>GeMTC could not be started. The following errors occured:</h3>';
    return _.reduce(errors, function(accum, error) {
      return accum.concat('<div style="padding: 10px">' + error + '</div>');
    }, errorPageHead);
  }

  return {
    runStartupDiagnostics: runStartupDiagnostics
  };
};
