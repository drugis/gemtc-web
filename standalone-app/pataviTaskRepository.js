'use strict';
var logger = require('./logger');

var _ = require('lodash');
var fs = require('fs');
var https = require('https');
var async = require('async');
var urlModule = require('url');
var httpStatus = require('http-status-codes');

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

function getJson(url, callback) {
  var opts = urlModule.parse(url);
  opts.ca = httpsOptions.ca;
  https.get(opts, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      callback(null, JSON.parse(body));
    });
  }).on('error', function(err) {
    callback(err);
  });
}

function getResult(taskId, callback) {
  logger.debug('pataviTaskRepository.getResult');
  getJson(taskId, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result.status !== "done") {
      return callback({
        description: "no result found"
      });
    }
    getJson(result._links.results.href, function(err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result.results);
    });
  });
}

function getPataviTasksStatus(taskIds, callback) {
  logger.debug('pataviTaskRepository.getPataviTasksStatus');

  function getTaskStatus(taskId, callback) {
    getJson(taskId, function(err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, {
        id: taskId,
        hasResult: (result.status === "done")
      });
    });
  }
  async.map(taskIds, getTaskStatus, function(err, results) {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

function createPataviTask(problem, callback) {
  logger.debug('pataviTaskRepository.createPataviTask');
  var reqOptions = {
    path: '/task?service=gemtc',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  var postReq = https.request(_.extend(httpsOptions, reqOptions), function(res) {
    if (res.statusCode === httpStatus.CREATED && res.headers.location) {
      callback(null, res.headers.location);
    } else {
      callback('Error queueing task: server returned code ' + res.statusCode);
    }
  });
  postReq.write(JSON.stringify(problem));
  postReq.end();
}

function deleteTask(id, callback) {
  var reqOptions = urlModule.parse(id);
  reqOptions.method = 'DELETE';
  var deleteReq = https.request(_.extend(httpsOptions, reqOptions), function(res) {
    if (res.statusCode === httpStatus.OK) {
      callback(null);
    } else {
      callback('Error deleting task: server returned code ' + res.statusCode);
    }
  });
  deleteReq.end();
}
