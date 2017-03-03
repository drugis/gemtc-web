'use strict';
var logger = require('./logger'),
  async = require('async'),
  modelRepository = require('./modelRepository'),
  pataviHandlerService = require('./pataviHandlerService'),
  pataviTaskRepository = require('./pataviTaskRepository'),
  analysisRepository = require('./analysisRepository'),
  httpStatus = require('http-status-codes');
var modelCache;
module.exports = {
  getPataviTask: getPataviTask,
  getMcdaPataviTask: getMcdaPataviTask
};


function getPataviTask(request, response) {
  var modelId = request.params.modelId;
  var analysisId = request.params.analysisId;

  var createdUrlCache;
  async.waterfall([
      function(callback) {
        modelRepository.get(modelId, callback);
      },
      function(model, callback) {
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
      function(analysis, callback) {
        pataviHandlerService.createPataviTask(analysis, modelCache, callback);
      },
      function(createdUrl, callback) {
        createdUrlCache = createdUrl;
        modelRepository.setTaskUrl(modelCache.id, createdUrl, callback);
      },
      function() {
        response
          .status(httpStatus.CREATED)
          .json({
            uri: createdUrlCache
          });
      }
    ],
    function(error) {
      if (error && error !== 'stop') {
        logger.error(error);
        response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
        response.end();
      }
    });
}

function getMcdaPataviTask(request, response) {
  logger.debug('getMcdaPataviTask, ' + request.body);

  pataviTaskRepository.create(request.body, 'service=smaa_v2&ttl=PT5M', function(error, taskUrl) {
    if (error && error !== 'stop') {
      logger.error(error);
      response.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
      response.end();
    } else {
      response
        .status(httpStatus.CREATED)
        .json({
          uri: taskUrl
        });
    }
  });
}
