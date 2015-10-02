var logger = require('./logger'),
  express = require('express'),
  status = require('http-status-codes'),
  _ = require('lodash'),
  async = require('async'),
  analysisRepository = require('./analysisRepository'),
  modelRepository = require('./modelRepository'),
  pataviTaskRouter = require('./pataviTaskRouter'),
  pataviTaskRepository = require('./pataviTaskRepository');

module.exports = express.Router({
    mergeParams: true
  })
  .post('/', createModel)
  .post(':modelId/something', function(request, response, next) {
    response.status(status.CREATED);
    console.log('something!');
    next();
  })
  .post('/:modelId/extendRunLength', extendRunLength)
  .get('/', find)
  .get('/:modelId', getModel)
  .use('/:modelId/task', pataviTaskRouter);

function internalError(error, response) {
  logger.error(error);
  response.sendStatus(status.INTERNAL_SERVER_ERROR);
  response.end();
}

function decorateWithHasResults(modelsResult, pataviResult) {
  var pataviTasks = _.indexBy(pataviResult, 'id');
  return _.map(modelsResult, function(model) {
    return _.extend(model, {
      hasResult: pataviTasks[model.taskId].hasresult
    });
  });
}

function find(request, response, next) {
  logger.debug('modelRouter.find');
  logger.debug('request.params.analysisId' + request.params.analysisId);

  var analysisId = request.params.analysisId;

  modelRepository.findByAnalysis(analysisId, function(error, modelsResult) {
    if (error) {
      internalError(error, response);
    } else {
      var modelsWithTasks = _.filter(modelsResult, function(model) {
        return model.taskId !== null && model.taskId !== undefined;
      });
      if (modelsWithTasks.length) {
        var taskIds = _.map(modelsWithTasks, 'taskId');
        pataviTaskRepository.getPataviTasksStatus(taskIds, function(error, pataviResult) {
          if (error) {
            internalError(error, response);
          } else {
            decoratedResult = decorateWithHasResults(modelsWithTasks, pataviResult);
            response.json(decoratedResult);
          }
        });
      } else {
        response.json(modelsResult);
      }
    }
  });
}

function createModel(request, response, next) {
  logger.debug('create model.');
  logger.debug('request.params.analysisId' + request.params.analysisId);
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

function extendRunLength(request, response, next) {
  logger.debug('extend model runlength.');
  logger.debug('analysisId ' + request.params.analysisId);
  var analysisId = request.params.analysisId;
  var modelId = request.params.modelId;
  var userId = request.session.userId;

  var modelCache;

  async.waterfall([
    function(callback) {
      analysisRepository.get(analysisId, callback);
    },
    function(analysis, callback) {
      logger.debug('check owner with ownerId = ' + analysis.owner + ' and userId = ' + userId);
      if (analysis.owner !== userId) {
        response.sendStatus(status.FORBIDDEN);
        response.end();
        callback('attempt to extend model that is not owned');
      } else {
        callback();
      }
    },
    function(callback) {
      modelRepository.getModel(modelId, callback);
    },
    function(model, callback) {
      modelCache = model;
      pataviTaskRepository.deleteTask(model.taskId, callback);
    }
  ], function(error, result) {
    if (error) {
      internalError(error, response);
    }
    next();
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
