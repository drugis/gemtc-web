'use strict';
var pg = require('pg');
var async = require('async');
var logger = require('./logger');

var pool;

module.exports = function(connectionInfo) {
  pool = !pool ? new pg.Pool(connectionInfo) : pool;

  logger.debug('db pool: ' + JSON.stringify(connectionInfo, null, 2));

  function startTransaction(client, done, callback) {
    logger.debug('START TRANSACTION');
    client.query('START TRANSACTION', function(err) {
      callback(err, client, done);
    });
  }

  function commit(client, done, results, callback) {
    logger.debug('COMMIT');
    client.query('COMMIT', function(err) {
      callback(err, client, done, results);
    });
  }

  function rollback(client, done) {
    logger.debug('ROLLBACK');
    client.query('ROLLBACK', function(err) {
      done(err);
    });
  }

  return {
    // Takes a function work(client, workCallback), where workCallback(error,
    // result). The work will be run in a transaction, and if workCallback is
    // called with an error, the transaction is aborted. Otherwise, the
    // transaction is committed.
    //
    // If the transaction completed, callback(error, result) will be called
    // with the result of work, otherwise with an error.
    runInTransaction: function(work, callback) {
      function doWork(client, done, callback) {
        work(client, function(err, result) {
          callback(err, client, done, result);
        });
      }

      pool.connect(function(err, client, done) {
        if (err) {
          logger.error(err);
          return callback(err);
        }
        async.waterfall([
          async.apply(startTransaction, client, done),
          doWork,
          commit
        ], function(err, client, done, result) {
          if (err) {
            logger.error(err);
            rollback(client, done);
            return callback(err);
          }
          done();
          callback(null, result);
        });
      });
    },
    query: function(text, values, callback) {
      logger.debug('db.query; text: ' + text + ' values: ' + values);
      pool.connect(function(err, client, done) {
        if (err) {
          logger.error(err);
          callback(err);
          return done();
        }
        client.query(text, values, function(err, result) {
          done();
          callback(err, result);
        });
      });
    }
  };
};
