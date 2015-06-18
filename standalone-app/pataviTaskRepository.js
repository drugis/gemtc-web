var logger = require('./logger');
var dbUtil = require('./dbUtil');
var db = require('./db')(dbUtil.buildPataviDBUrl());

module.exports = {
  get: getPataviTask,
  create: createPataviTask
};

function getPataviTask(modelId, callback) {
  db.query('SELECT * FROM patavitask WHERE modelId=$1', [modelId], function(error, result) {
    if (error) {
      callback(error);
    } else {
      callback(null, result.rows[0]);
    }
  });
}

function createPataviTask(problem, callback) {
  db.query("INSERT INTO patavitask (problem, method) VALUES($1, 'gemtc') RETURNING id", [
    problem
  ], function(error, result) {
    if (error) {
      callback(error);
    } else {
      callback(null, result.rows[0].id);
    }
  });
}
