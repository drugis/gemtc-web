var logger = require('./logger');
var db = require('./db');

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

function createPataviTask(modelId, problem, callback) {
  db.query("INSERT INTO patavitask (modelId, problem, method) VALUES($1, $2, 'gemtc') RETURNING id", [
    modelId,
    problem
  ], function(error, result) {
    if (error) {
      callback(error);
    } else {
      callback(null, result.rows[0].id);
    }
  });
}
