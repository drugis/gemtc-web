var logger = require('./logger');
var express = require('express');
var async = require('async');
var modelRepository = require('./modelRepository');
var pataviTaskRepository = require('./pataviTaskRepository');
var analysisRepository = require('./analysisRepository');

module.exports = express.Router({
  mergeParams: true
})
  .get('/', getPataviTask);

function getPataviTask(request, response, next) {
  var modelId = request.params.modelId;
  var analysisId = request.params.analysisId;

  var modelCache;
  var createdIdCache;
  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    }, function(model, callback) {
      modelCache = model;
      if (model.taskId) {
        response.json({
          uri: process.env.PATAVI_URI + task.id
        });
      } else {
        analysisRepository.get(analysisId, callback);
      }
    }, function(analysis, callback) {
      pataviTaskRepository.create(modelCache.id, analysis.problem, callback);
    }, function(createdId, callback) {
      createdIdCache = createdId;
      modelRepository.setTaskId(modelCache.id, createdId, callback);
    }, function() {
      response.json({
        uri: process.env.PATAVI_URI + createdIdCache
      });
    }]);

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
