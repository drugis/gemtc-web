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
      var modelsWithoutTasks = _.filter(modelsResult, function(model) {
        return model.taskId === null || model.taskId === undefined;
      });
      if (modelsWithTasks.length) {
        var taskIds = _.map(modelsWithTasks, 'taskId');
        pataviTaskRepository.getPataviTasksStatus(taskIds, function(error, pataviResult) {
          if (error) {
            internalError(error, response);
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
      checkOwnership(response, analysis.owner, userId, callback);
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
      next();
    }
  ], function(error) {
    if (error) {
      internalError(error, response);
    }
    next();
  });
}

function checkOwnership(response, owner, userId, callback) {
  logger.debug('check owner with ownerId = ' + owner + ' and userId = ' + userId);
  if (owner !== userId) {
    response.sendStatus(status.FORBIDDEN);
    response.end();
    callback('attempt to modify model in analysis that is not owned');
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
      checkOwnership(response, analysis.owner, userId, callback);
    },
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      modelCache = model;
      modelService.update(modelCache, newModel, callback);
    },
    function(callback) {
      pataviTaskRepository.deleteTask(modelCache.taskId, callback);
    },
    function(callback) {
      response.sendStatus(status.OK);
    }
  ], function(error) {
    if (error) {
      console.log(error);
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
