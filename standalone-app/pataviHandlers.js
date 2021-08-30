'use strict';
const logger = require('./logger');
const async = require('async');
const modelRepository = require('./modelRepository');
const pataviHandlerService = require('./pataviHandlerService');
const pataviTaskRepository = require('./pataviTaskRepository');
const analysisRepository = require('./analysisRepository');
const httpStatus = require('http-status-codes');
let modelCache;

module.exports = {
  getPataviTask,
  getMcdaPataviTask
};

function getPataviTask(request, response) {
  const modelId = request.params.modelId;
  const analysisId = request.params.analysisId;

  let createdUrlCache;
  async.waterfall(
    [
      (callback) => {
        modelRepository.get(modelId, callback);
      },
      (model, callback) => {
        modelCache = model;
        if (model.taskUrl) {
          response.json({
            uri: model.taskUrl
          });
          callback('stop');
        } else {
          analysisRepository.get(analysisId, callback);
        }
      },
      (analysis, callback) => {
        pataviHandlerService.createPataviTask(analysis, modelCache, callback);
      },
      (createdUrl, callback) => {
        createdUrlCache = createdUrl;
        modelRepository.setTaskUrl(modelCache.id, createdUrl, callback);
      },
      () => {
        response.status(httpStatus.CREATED).json({
          uri: createdUrlCache
        });
      }
    ],
    (error) => {
      if (error && error !== 'stop') {
        logger.error(error);
        response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
        response.end();
      }
    }
  );
}

function getMcdaPataviTask(request, response) {
  logger.debug('getMcdaPataviTask, ' + request.body);

  pataviTaskRepository.create(
    request.body,
    'service=smaa_v2&ttl=PT5M',
    (error, taskUrl) => {
      if (error && error !== 'stop') {
        logger.error(error);
        response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
        response.end();
      } else {
        response.status(httpStatus.CREATED).json({
          uri: taskUrl
        });
      }
    }
  );
}
