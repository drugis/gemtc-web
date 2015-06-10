var logger = require('./logger');
var express = require('express');
var status = require('http-status-codes');

var analysisRepository = require('./analysisRepository');
var modelRepository = require('./modelRepository');
var pataviTaskRouter = require('./pataviTaskRouter');

module.exports = express.Router({
  mergeParams: true
})
  .post('/', createModel)
  .get('/:modelId', getModel)
  .use('/:modelId/task', pataviTaskRouter)
;

function internalError(error, response) {
  logger.error(error);
  response.sendStatus(status.INTERNAL_SERVER_ERROR);
  response.end();
}

function createModel(request, response, next) {
  logger.debug('create model.');
  var analysisId = request.params.analysisId;
  var userId = request.session.userId;
  analysisRepository.get(analysisId, function(error, analysis) {
    if (error) {
      internalError(error, response);
    } else {
      logger.debug('check owner with ownerId = ' + analysis.owner + ' and userId = ' + userId);
      if (analysis.owner !== userId) {
        response.sendStatus(status.FORBIDDEN);
        response.end();
      } else {
        modelRepository.create(userId, analysisId, function(error, createdId) {
          if (error) {
            internalError(error, response);
          } else {
            response.location('/analyses/' + analysisId + '/models/' + createdId);
            response.sendStatus(status.CREATED);
            next();
          }
        });
      }
    }
  });

}

function getModel(request, response, next) {
  var modelId = request.params.modelId;
  modelRepository.get(modelId, function(error, result) {
    if (error) {
      internalError(error, response);
    } else {
      response.json(result);
    }
  });
}
