'use strict';
var logger = require('./logger'),
  async = require('async'),
  modelRepository = require('./modelRepository'),
  pataviHandlerService = require('./pataviHandlerService'),
  analysisRepository = require('./analysisRepository'),
  httpStatus = require('http-status-codes')
;
var modelCache;
module.exports = {
  getPataviTask: getPataviTask
};


function getPataviTask(request, response) {
  var modelId = request.params.modelId;
  var analysisId = request.params.analysisId;

  var createdIdCache;
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
      function(createdId, callback) {
        createdIdCache = createdId;
        modelRepository.setTaskUrl(modelCache.id, createdId, callback);
      },
      function() {
        response.json({
          uri: createdIdCache
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
