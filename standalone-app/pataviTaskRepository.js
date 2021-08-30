'use strict';
const logger = require('./logger');
const _ = require('lodash');
const https = require('https');
const http = require('http');
const async = require('async');
const {URL} = require('url');
const httpStatus = require('http-status-codes');

module.exports = {
  getResult,
  getPataviTasksStatus,
  create,
  deleteTask
};

const httpsOptions = {
  hostname: process.env.PATAVI_HOST || 'localhost',
  port: process.env.PATAVI_PORT || 3000
};

const protocol = process.env.SECURE_TRAFFIC === 'false' ? http : https;

function getJson(url, callback) {
  const opts = new URL(url);
  protocol
    .get(opts, function (res) {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        callback(null, JSON.parse(body));
      });
    })
    .on('error', function (err) {
      callback(err);
    });
}

function getResult(taskUrl, callback) {
  logger.debug('pataviTaskRepository.getResult');
  getJson(taskUrl, function (err, result) {
    if (err) {
      return callback(err);
    }
    if (result.status !== 'done') {
      return callback({
        description: 'no result found'
      });
    }
    getJson(result._links.results.href, function (err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
  });
}

function getPataviTasksStatus(taskUrls, callback) {
  logger.debug('pataviTaskRepository.getPataviTasksStatus');

  function getTaskStatus(taskUrl, callback) {
    logger.debug('getting ' + taskUrl);
    getJson(taskUrl, function (err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, {
        id: taskUrl,
        runStatus: result.status
      });
    });
  }
  async.map(taskUrls, getTaskStatus, function (err, results) {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

function create(problem, params, callback) {
  logger.debug('pataviTaskRepository.createPataviTask; params: ' + params);
  const path = `/task${params ? '?' + params : ''}`;
  const reqOptions = {
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-api-key': process.env.PATAVI_API_KEY,
      'X-client-name': 'GeMTC-open'
    }
  };
  const postReq = protocol.request({...httpsOptions, ...reqOptions}, (res) => {
    if (
      res.statusCode === httpStatus.StatusCodes.CREATED &&
      res.headers.location
    ) {
      callback(null, res.headers.location);
    } else {
      callback('Error queueing task: server returned code ' + res.statusCode);
    }
  });
  postReq.write(JSON.stringify(problem));
  postReq.end();
}

function deleteTask(id, callback) {
  const reqOptions = {
    ...new URL(id),
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-api-key': process.env.PATAVI_API_KEY,
      'X-client-name': 'GeMTC-open'
    }
  };
  const deleteReq = protocol.request(
    _.extend(httpsOptions, reqOptions),
    function (res) {
      if (res.statusCode === httpStatus.StatusCodes.OK) {
        callback(null);
      } else {
        callback('Error deleting task: server returned code ' + res.statusCode);
      }
    }
  );
  deleteReq.end();
}
