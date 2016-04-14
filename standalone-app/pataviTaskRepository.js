var logger = require('./logger');
var dbUtil = require('./dbUtil');
var db = require('./db')(dbUtil.pataviDBUrl);

var _ = require('lodash');
var fs = require('fs');
var https = require('https');

module.exports = {
  getResult: getResult,
  getPataviTasksStatus: getPataviTasksStatus,
  create: createPataviTask,
  deleteTask: deleteTask
};

var httpsOptions = {
  hostname: process.env.PATAVI_HOST,
  port: process.env.PATAVI_PORT,
  key: fs.readFileSync(process.env.PATAVI_CLIENT_KEY),
  cert: fs.readFileSync(process.env.PATAVI_CLIENT_CRT),
  ca: fs.readFileSync(process.env.PATAVI_CA)
};

function getResult(taskId, callback) {
  db.query('SELECT result FROM patavitask WHERE id = $1', [taskId], function(error, result) {
    if (error) {
      callback(error);
    } else {
      if (result.rows.length === 0 || !result.rows[0].result) {
        callback({
          description: "no result found"
        });
      } else {
        callback(null, JSON.parse(result.rows[0].result).results);
      }
    }
  });
}

function getPataviTasksStatus(taskIds, callback) {
  logger.debug('pataviTaskRepository.getPataviTasksStatus');
  if (taskIds.length === 0) {
    callback(null, []);
  }
  var params = taskIds.map(function(item, idx) {
    return '$' + (idx + 1);
  });
  db.query('SELECT id, result IS NOT NULL as hasResult FROM patavitask WHERE id in (' + params.join(',') + ')', taskIds, function(error, result) {
    if (error) {
      logger.error('an error occured during: pataviTaskRepository.getPataviTasksStatus');
      callback(error);
    } else {
      callback(null, result.rows);
    }
  });
}

function createPataviTask(problem, callback) {
  logger.debug('pataviTaskRepository.createPataviTask');
  var reqOptions = {
    path: '/task?method=gemtc',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  var postReq = https.request(_.extend(httpsOptions, reqOptions), function(res) {
    if (res.statusCode == 201 && res.headers.location) {
      callback(null, res.headers.location);
    } else {
      callback('Error queueing task: server returned code ' + res.statusCode);
    }
  });
  postReq.write(JSON.stringify(problem));
  postReq.end();
}

function deleteTask(id, callback) {
  logger.debug('deleting patavi task');
  db.query('DELETE FROM patavitask WHERE id=$1', [id], function(error, result) {
    if (error) {
      callback(error);
    } else {
      callback();
    }
  });
}
