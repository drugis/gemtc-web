var logger = require('./logger');
var async = require('async');
var modelRepository = require('./modelRepository');
var pataviTaskRepository = require('./pataviTaskRepository');
var analysisRepository = require('./analysisRepository');
var status = require('http-status-codes');

module.exports = {
  getPataviTask: getPataviTask
};

function getPataviTask(request, response, next) {
  var modelId = request.params.modelId;
  var analysisId = request.params.analysisId;

  var modelCache;
  var createdIdCache;
  async.waterfall([
      function(callback) {
        modelRepository.get(modelId, callback);
      },
      function(model, callback) {
        modelCache = model;
        if (model.taskid) {
          response.json({
            uri: process.env.PATAVI_URI + model.taskid
          });
          callback('stop');
        } else {
          analysisRepository.get(analysisId, callback);
        }
      },
      function(analysis, callback) {
        pataviTaskRepository.create(analysis.problem, callback);
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



  // modelRepository.get(modelId, function(error, model) {
  //   if (error) {
  //     logger.error('error retrieving model'); response.end();
  //   } else {
  //     if (model.taskId) {
  //       response.json({
  //         uri: process.env.PATAVI_URI + task.id
  //       });
  //     } else {
  //       analysisRepository.get(analysisId, function(error, analysis) {
  //         pataviTaskRepository.create(model.id, analysis.problem, function(error, createdId) {
  //           modelRepository.setTaskId(model.id, createdId, function(error) {
  //             if (error) {
  //               logger.error('error setting model task id'); response.end();
  //             } else {
  //               response.json({
  //                 uri: process.env.PATAVI_URI + createdId
  //               });
  //             }
  //           });
  //         });
  //       });
  //     }
  //   }
  // });
}