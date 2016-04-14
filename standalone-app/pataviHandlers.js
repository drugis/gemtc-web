var logger = require('./logger'),
  async = require('async'),
  modelRepository = require('./modelRepository'),
  pataviTaskRepository = require('./pataviTaskRepository'),
  pataviHandlerService = require('./pataviHandlerService'),
  analysisRepository = require('./analysisRepository'),
  status = require('http-status-codes')
;
var modelCache;
module.exports = {
  getPataviTask: getPataviTask
};


function getPataviTask(request, response, next) {
  var modelId = request.params.modelId;
  var analysisId = request.params.analysisId;

  var createdIdCache;
  async.waterfall([
      function(callback) {
        modelRepository.get(modelId, callback);
      },
      function(model, callback) {
        modelCache = model;
        if (model.taskId) {
          response.json({
            uri: 'https://' + process.env.PATAVI_HOST + ':' + process.env.PATAVI_PORT + model.taskId
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
        modelRepository.setTaskId(modelCache.id, createdId, callback);
      },
      function() {
        response.json({
          uri: 'https://' + process.env.PATAVI_HOST + ':' + process.env.PATAVI_PORT + createdIdCache
        });
      }
    ],
    function(error, callback) {
      if (error && error !== 'stop') {
        logger.error(error);
        response.sendStatus(status.INTERNAL_SERVER_ERROR);
        response.end();
      }
    });
}
