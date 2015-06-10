var logger = require('./logger');
var express = require('express');
var pataviTaskRepository = require('./pataviTaskRepository');
var analysisRepository = require('./analysisRepository');

module.exports = express.Router({
  mergeParams: true
})
  .get('/', getPataviTask);

function getPataviTask(request, response, next) {
  var modelId = request.params.modelId;
  var analysisId = request.params.analysisId;

  pataviTaskRepository.get(modelId, function(error, task) {
    if (error) {
      logger.error('error retrieving patavi task'); response.end();
    } else {
      if (task) {
        response.json({
          uri: process.env.PATAVI_URI + task.id
        });
      } else {
        analysisRepository.get(analysisId, function(error, analysis) {
          pataviTaskRepository.create(modelId, analysis.problem, function(error, createdId) {
            response.json({
              uri: process.env.PATAVI_URI + createdId
            });
          });
        });
      }
    }

  });
//  if (pataviTask == null) {
//    NetworkMetaAnalysisProblem problem = (NetworkMetaAnalysisProblem) problemService.getProblem(projectId, analysisId);
//    pataviTask = pataviTaskRepository.createPataviTask(modelId, problem);
//  }
//  logger.info("PATAVI_URI_BASE: " + PATAVI_URI_BASE);
//  return new PataviTaskUriHolder(PATAVI_URI_BASE + pataviTask.getId());
}
