var logger = require('./logger');
var dbUtil = require('./dbUtil');
var db = require('./db')(dbUtil.buildPataviDBUrl());

module.exports = {
  getPataviTasksStatus: getPataviTasksStatus,
  create: createPataviTask
};

function getPataviTasksStatus(modelIds, callback) {
  var params = modelIds.map(function(item, idx) {
    return '$' + (idx+1);
  });
  db.query('SELECT id, result IS NOT NULL as hasResult FROM patavitask WHERE id in (' + params.join(',') + ')', modelIds, function(error, result) {
    if (error) {
      callback(error);
    } else {
      callback(null, result.rows);
    }
  });
}

function createPataviTask(problem, callback) {
  logger.debug('pataviTaskRepository.createPataviTask');
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
