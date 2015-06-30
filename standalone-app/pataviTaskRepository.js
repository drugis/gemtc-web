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

function createPataviTask(problem, linearModel, callback) {
  logger.debug('pataviTaskRepository.createPataviTask with linearModel' + linearModel);
  db.query("INSERT INTO patavitask (problem, linearModel, method) VALUES($1, $2, 'gemtc') RETURNING id", [
    problem,
    linearModel
  ], function(error, result) {
    if (error) {
      callback(error);
    } else {
      callback(null, result.rows[0].id);
    }
  });
}
