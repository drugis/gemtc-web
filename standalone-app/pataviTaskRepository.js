var logger = require('./logger');
var dbUtil = require('./dbUtil');
var db = require('./db')(dbUtil.buildPataviDBUrl());

module.exports = {
  getResult: getResult,
  getPataviTasksStatus: getPataviTasksStatus,
  create: createPataviTask,
  deleteTask: deleteTask
};

function getResult(taskId, callback) {
  db.query('SELECT result FROM patavitask WHERE id = $1', [taskId], function(error, result) {
    if(error) {
      callback(error);
    } else {
      callback(null, JSON.parse(result.rows[0].result).results);
    }
  });
}

function getPataviTasksStatus(taskIds, callback) {
  if(taskIds.length === 0) {
    callback(null, []);
  }
  var params = taskIds.map(function(item, idx) {
    return '$' + (idx+1);
  });
  db.query('SELECT id, result IS NOT NULL as hasResult FROM patavitask WHERE id in (' + params.join(',') + ')', taskIds, function(error, result) {
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

function deleteTask(id, callback) {
  logger.debug('deleting patavi task');
  db.query('DELETE FROM patavitask WHERE id=$1', [id], function(error, result){
    if (error) {
      callback(error);
    } else {
      callback();
    }
  });
}
