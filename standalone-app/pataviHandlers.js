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
            uri: process.env.PATAVI_URI + model.taskId
          });
          callback('stop');
        } else {
          analysisRepository.get(analysisId, callback);
        }
      },
      function(analysis, callback) {
        console.log('yo model chache : ' + JSON.stringify(modelCache));
        pataviHandlerService.createPataviTask(analysis, modelCache, callback);
      },
      function(createdId, callback) {
        createdIdCache = createdId;
        modelRepository.setTaskId(modelCache.id, createdId, callback);
      },
      function() {
        response.json({
          uri: process.env.PATAVI_URI + createdIdCache
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