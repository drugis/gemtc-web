var logger = require('./logger'),
  express = require('express'),
  status = require('http-status-codes'),
  _ = require('lodash'),
  async = require('async'),
  analysisRepository = require('./analysisRepository'),
  modelRepository = require('./modelRepository'),
  modelService = require('./modelService'),
  pataviTaskRouter = require('./pataviTaskRouter'),
  pataviTaskRepository = require('./pataviTaskRepository');

module.exports = express.Router({
    mergeParams: true
  })
  .get('/', find)
  .post('/', createModel)
  .get('/:modelId', getModel)
  .post('/:modelId', extendRunLength)
  .get('/:modelId/result', getResult)
  .use('/:modelId/task', pataviTaskRouter);

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
      next({
        statusCode: 500,
        message: error
      });
    } else {
      var modelsWithTasks = _.filter(modelsResult, function(model) {
        return model.taskId !== null && model.taskId !== undefined;
      });
      var modelsWithoutTasks = _.filter(modelsResult, function(model) {
        return model.taskId === null || model.taskId === undefined;
      });
      if (modelsWithTasks.length) {
        var taskIds = _.map(modelsWithTasks, 'taskId');
        pataviTaskRepository.getPataviTasksStatus(taskIds, function(error, pataviResult) {
          if (error) {
            next({
              statusCode: 500,
              message: error
            });
          } else {
            decoratedResult = decorateWithHasResults(modelsWithTasks, pataviResult);
            response.json(decoratedResult.concat(modelsWithoutTasks));
          }
        });
      } else {
        response.json(modelsResult);
      }
    }
  });
}

function getResult(request, response, next) {
  logger.debug('modelRouter.getResult');
  logger.debug('request.params.analysisId' + request.params.analysisId);
  var analysisId = request.params.analysisId;
  var modelId = request.params.modelId;
  var modelCache;

  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      modelCache = model;
      if (model.taskId === null || model.taskId === undefined) {
        callback({
          statusCode: 404,
          message: 'attempt to get results of model with no task'
        });
      }
      callback();
    },
    function(callback) {
      pataviTaskRepository.getResult(modelCache.taskId, callback);
    },
    function(pataviResult, callback) {
      response.status(status.OK);
      response.json(pataviResult);
    }
  ], function(error, result) {
    if (error) {
      response.status(404).send({
        error: 'no result found for model with id ' + modelId
      });
    } else {
      next();
    }
  });
}

function createModel(request, response, next) {
  logger.debug('create model.');
  logger.debug('request.params.analysisId' + request.params.analysisId);
  var analysisId = request.params.analysisId;
  var userId = request.session.userId;
  var modelCache;

  async.waterfall([
    function(callback) {
      analysisRepository.get(analysisId, callback);
    },
    function(analysis, callback) {
      checkOwnership(analysis.owner, userId, callback);
    },
    function(callback) {
      modelRepository.create(userId, analysisId, request.body, callback);
    },
    function(createdId, callback) {
      response
        .location('/analyses/' + analysisId + '/models/' + createdId)
        .status(status.CREATED)
        .json({
          id: createdId
        });
    }
  ], function(error) {
    if (error) {
      next(error);
    }
  });
}

function checkOwnership(owner, userId, callback) {
  logger.debug('check owner with ownerId = ' + owner + ' and userId = ' + userId);
  if (owner != userId) {
    callback({
      statusCode: 403,
      message: 'attempt to modify model in not-owned analysis'
    });
  } else {
    callback();
  }
}

function checkCoordinates(analysisId, model, callback) {
  logger.debug('check analysisId = ' + analysisId + ' and model.analysisId = ' + model.analysisId);
  if (analysisId != model.analysisId) {
    callback({
      statusCode: 404,
      message: 'analysis/model combination not found'
    });
  } else {
    callback();
  }
}

function extendRunLength(request, response, next) {
  logger.debug('extend model runlength.');
  logger.debug('analysisId ' + request.params.analysisId);
  var analysisId = request.params.analysisId;
  var modelId = request.params.modelId;
  var userId = request.session.userId;

  var modelCache;
  var newModel = request.body;

  async.waterfall([
    function(callback) {
      analysisRepository.get(analysisId, callback);
    },
    function(analysis, callback) {
      checkOwnership(analysis.owner, userId, callback);
    },
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      modelCache = model;
      checkCoordinates(analysisId, modelCache, callback);
    },
    function(callback) {
      modelService.update(modelCache, newModel, callback);
    },
    function(callback) {
      pataviTaskRepository.deleteTask(modelCache.taskId, callback);
    },
    function(callback) {
      response.sendStatus(status.OK);
    }
  ], next);
}

function getModel(request, response, next) {
  var modelId = request.params.modelId;
  modelRepository.get(modelId, function(error, result) {
    if (error) {
      next({
        statusCode: 404,
        message: error
      });
    } else {
      response.json(result);
    }
  });
}