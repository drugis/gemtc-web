'use strict';
var logger = require('./logger');
var httpStatus = require('http-status-codes');
var _ = require('lodash');
var async = require('async');
var modelRepository = require('./modelRepository');
var modelService = require('./modelService');
var pataviTaskRepository = require('./pataviTaskRepository');
var funnelPlotRepository = require('./funnelPlotRepository');
var modelBaselineRepository = require('./modelBaselineRepository');

function find(request, response, next) {
  logger.debug('modelHandler.find');

  var analysisId = request.params.analysisId;
  modelRepository.findByAnalysis(analysisId, function(error, modelsResult) {
    if (error) {
      return next({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error
      });
    }

    var { modelsWithTask, modelsWithoutTask } = modelService.partitionModels(modelsResult);
    if (modelsWithTask.length) {
      const protocol = process.env.GEMTC_HOST ? process.env.GEMTC_HOST.split('://')[0] : 'http' + '://';
      var taskUrls = _.map(modelsWithTask, (model) => protocol + model.taskUrl.split('://')[1]);
      pataviTaskRepository.getPataviTasksStatus(taskUrls, function(error, pataviResult) {
        if (error) {
          errorCallback(next, error);
        } else {
          var decoratedResult = modelService.decorateWithRunStatus(modelsWithTask, pataviResult);
          response.json(decoratedResult.concat(modelsWithoutTask));
        }
      });
    } else {
      response.json(modelsResult);
    }
  });
}

function getResult(request, response, next) {
  logger.debug('modelHandler.getResult');
  logger.debug('request.params.analysisId' + request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);

  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      if (model.taskUrl === null || model.taskUrl === undefined) {
        callback('Error, model ' + modelId + ' does not have a task url');
      } else {
        callback(null, model);
      }
    },
    function(model, callback) {
      pataviTaskRepository.getResult(model.taskUrl, callback);
    },
    function(pataviResult) {
      response.status(httpStatus.OK);
      response.json(pataviResult);
    }
  ], _.partial(errorCallback, next));
}

function createModel(request, response, next) {
  logger.debug('create model.');
  var analysisId = Number.parseInt(request.params.analysisId);
  logger.debug('analysisId: ' + analysisId);
  async.waterfall([
    function(callback) {
      modelRepository.create(analysisId, request.body, callback);
    },
    function(createdId) {
      response.location('/analyses/' + analysisId + '/models/' + createdId);
      response.status(httpStatus.CREATED);
      response.json({
        id: createdId
      });
    }
  ], _.partial(errorCallback, next));
}

function extendRunLength(request, response, next) {
  logger.debug('extend model runlength.');
  logger.debug('analysisId ' + request.params.analysisId);
  var analysisId = Number.parseInt(request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);

  var modelCache;
  var newModel = request.body;

  async.waterfall([
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
      pataviTaskRepository.deleteTask(modelCache.taskUrl, callback);
    },
    function() {
      response.sendStatus(httpStatus.OK);
    }
  ], _.partial(errorCallback, next));
}

function addFunnelPlot(request, response, next) {
  logger.debug('add funnel plot');
  var analysisId = Number.parseInt(request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);

  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      checkCoordinates(analysisId, model, callback);
    },
    function(callback) {
      funnelPlotRepository.create(modelId, request.body, callback);
    },
    function() {
      response.sendStatus(httpStatus.CREATED);
    }
  ], _.partial(errorCallback, next));
}

function queryFunnelPlots(request, response, next) {
  var modelId = Number.parseInt(request.params.modelId);
  getFromGetterById(response, next, funnelPlotRepository.findByModelId, modelId);
}

function getFunnelPlot(request, response, next) {
  var plotId = Number.parseInt(request.params.plotId);
  getFromGetterById(response, next, funnelPlotRepository.findByPlotId, plotId);
}

function getBaseline(request, response, next) {
  var modelId = Number.parseInt(request.params.modelId);
  getFromGetterById(response, next, modelBaselineRepository.get, modelId);
}

function getFromGetterById(response, next, getter, id) {
  getter(id, function(error, result) {
    if (error) {
      errorCallback(next, error);
    } else {
      response.json(result);
    }
  });
}

function setBaseline(request, response, next) {
  logger.debug('set model baseline');
  var analysisId = Number.parseInt(request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);
  var baseline = request.body;

  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      checkCoordinates(analysisId, model, callback);
    },
    function(callback) {
      modelBaselineRepository.set(modelId, baseline, callback);
    },
    function() {
      response.sendStatus(httpStatus.OK);
    }
  ], _.partial(errorCallback, next));
}

function checkCoordinates(analysisId, model, callback) {
  logger.debug('check analysisId = ' + analysisId + ' and model.analysisId = ' + model.analysisId);
  if (analysisId !== model.analysisId) {
    callback('Error, could not find analysis/model combination');
  } else {
    callback();
  }
}

function setAttributes(request, response, next) {
  logger.debug('set model attributes');
  var analysisId = Number.parseInt(request.params.analysisId);
  var modelId = Number.parseInt(request.params.modelId);
  var isArchived = request.body.archived;
  var modelToSet;
  var archivedOn = isArchived ? new Date() : null;
  async.waterfall([
    function(callback) {
      modelRepository.get(modelId, callback);
    },
    function(model, callback) {
      modelToSet = model;
      checkCoordinates(analysisId, model, callback);
    },
    function(callback) {
      modelRepository.setArchive(modelToSet.id, isArchived, archivedOn, callback);
    },
    function() {
      response.sendStatus(httpStatus.OK);
    }
  ], _.partial(errorCallback, next));
}

function getModel(request, response, next) {
  var modelId = Number.parseInt(request.params.modelId);
  modelRepository.get(modelId, function(error, result) {
    if (error) {
      next({
        statusCode: httpStatus.NOT_FOUND,
        message: error
      });
    } else {
      response.json(result);
    }
  });
}

function setTitle(request, response, next) {
  logger.debug('modelHandler.setTitle');
  var modelId = request.params.modelId;
  var newTitle = request.body.newTitle;
  modelRepository.setTitle(modelId, newTitle, _.partial(okCallback, response, next));
}

function setSensitivity(request, response, next) {
  logger.debug('modelHandler.setSensitivity');
  var modelId = request.params.modelId;
  var newSensitivity = request.body;
  modelRepository.setSensitivity(modelId, newSensitivity, _.partial(okCallback, response, next));
}

function deleteModel(request, response, next) {
  logger.debug('modelHandler.deleteModel');
  var modelId = request.params.modelId;
  modelRepository.deleteModel(modelId, _.partial(okCallback, response, next));
}

function errorCallback(next, error) {
  next({
    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
    message: error
  });
}

function okCallback(response, next, error) {
  if (error) {
    errorCallback(next, error);
  } else {
    response.sendStatus(httpStatus.OK);
  }
}

module.exports = {
  find: find,
  createModel: createModel,
  getModel: getModel,
  extendRunLength: extendRunLength,
  getResult: getResult,
  getBaseline: getBaseline,
  setBaseline: setBaseline,
  setTitle: setTitle,
  setSensitivity: setSensitivity,
  setAttributes: setAttributes,
  addFunnelPlot: addFunnelPlot,
  queryFunnelPlots: queryFunnelPlots,
  getFunnelPlot: getFunnelPlot,
  deleteModel: deleteModel
};
