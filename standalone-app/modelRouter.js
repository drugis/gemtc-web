var logger = require('./logger');
var express = require('express');
var status = require('http-status-codes');
var _ = require('lodash');

var analysisRepository = require('./analysisRepository');
var modelRepository = require('./modelRepository');
var pataviTaskRouter = require('./pataviTaskRouter');
var pataviTaskRepository = require('./pataviTaskRepository');

module.exports = express.Router({
    mergeParams: true
  })
  .get('/', find)
  .post('/', createModel)
  .get('/:modelId', getModel)
  .use('/:modelId/task', pataviTaskRouter);

function internalError(error, response) {
  logger.error(error);
  response.sendStatus(status.INTERNAL_SERVER_ERROR);
  response.end();
}

function decorateWithHasResults(modelsResult, pataviResult) {
  var pataviTasks = _.indexBy(pataviResult, 'id');
  return _.map(modelsResult, function(row) {
    console.log('row ' + JSON.stringify(row));
    return _.extend(row, {
      hasResult: pataviTasks[row.taskId].hasresult
    });
  });
}

function find(request, response, next) {
  logger.debug('modelRouter.find');
  var analysisId = request.params.analysisId;
  modelRepository.findByAnalysis(analysisId, function(error, modelsResult) {
    if (error) {
      internalError(error, response);
    } else {
      var modelsWithTasks = _.filter(modelsResult, function(model) {
        return model.taskId !== null;
      });
      var modelIdsWithTasks = _.map(modelsWithTasks, function(filteredModel) {
        return {
          id: filteredModel.id,
          taskId: filteredModel.taskId
        };
      });
      pataviTaskRepository.getPataviTasksStatus(_.map(modelIdsWithTasks, 'taskId'), function(error, pataviResult) {
        if (error) {
          internalError(error, response);
        } else {
          decoratedResult = decorateWithHasResults(modelsWithTasks, pataviResult);
          response.json(decoratedResult);
        }
      });
    }
  });
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
        modelRepository.create(userId, analysisId, request.body, function(error, createdId) {
          if (error) {
            internalError(error, response);
          } else {
            response
              .location('/analyses/' + analysisId + '/models/' + createdId)
              .json({
                id: createdId
              })
              .status(status.CREATED);
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
