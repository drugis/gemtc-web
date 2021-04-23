'use strict';
var logger = require('./logger');
var analysisRepository = require('./analysisRepository');
var statusCodes = require('http-status-codes');
var _ = require('lodash');
var async = require('async');
var modelRepository = require('./modelRepository');
var modelService = require('./modelService');
var pataviTaskRepository = require('./pataviTaskRepository');
const {call} = require('file-loader');

function queryAnalyses(request, response, next) {
  logger.debug('query analyses');
  analysisRepository.query(request.user.id, function (error, result) {
    jsonCallback(response, next, error, error ? undefined : result.rows);
  });
}

function getAnalysis(request, response, next) {
  logger.debug('get analysis by id ' + request.params.analysisId);
  analysisRepository.get(request.params.analysisId, function (error, analysis) {
    jsonCallback(response, next, error, analysis);
  });
}

function createAnalysis(request, response, next) {
  logger.debug('create analysis: ' + JSON.stringify(request.body));
  logger.debug('request.user.id: ' + request.user.id);
  analysisRepository.create(request.user.id, request.body, function (
    error,
    newAnalysisId
  ) {
    if (error) {
      next({
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
        message: error
      });
    } else {
      response.location('/analyses/' + newAnalysisId);
      response.sendStatus(statusCodes.CREATED);
    }
  });
}

function getProblem(request, response, next) {
  logger.debug('analysisHandler.getProblem');
  analysisRepository.get(request.params.analysisId, function (error, result) {
    jsonCallback(response, next, error, error ? undefined : result.problem);
  });
}

function setPrimaryModel(request, response, next) {
  logger.info('analysisHandler.setPrimaryModel');
  var analysisId = request.params.analysisId;
  var modelId = request.query.modelId;
  analysisRepository.setPrimaryModel(
    analysisId,
    modelId,
    _.partial(okCallback, response, next)
  );
}

function setTitle(request, response, next) {
  logger.debug('analysisHandler.setTitle');
  var analysisId = request.params.analysisId;
  var newTitle = request.body.newTitle;
  analysisRepository.setTitle(
    analysisId,
    newTitle,
    _.partial(okCallback, response, next)
  );
}

function setOutcome(request, response, next) {
  logger.debug('analysisHandler.setOutcome');
  var analysisId = request.params.analysisId;
  var newOutcome = request.body;
  analysisRepository.setOutcome(
    analysisId,
    newOutcome,
    _.partial(okCallback, response, next)
  );
}

function deleteAnalysis(request, response, next) {
  logger.debug('analysisHandler.deleteAnalysis');
  var analysisId = request.params.analysisId;
  analysisRepository.deleteAnalysis(
    analysisId,
    _.partial(okCallback, response, next)
  );
}

function setProblem(request, response, next) {
  logger.debug('analysisHandler.setProblem');
  var analysisId = request.params.analysisId;
  var problem = request.body;
  async.waterfall(
    [
      function (callback) {
        modelRepository.findByAnalysis(analysisId, callback);
      },
      function (models, callback) {
        var {modelsWithTask} = modelService.partitionModels(models);
        if (modelsWithTask.length) {
          _.forEach(modelsWithTask, (model) => {
            async.waterfall(
              [
                _.partial(pataviTaskRepository.deleteTask, model.taskUrl),
                _.partial(modelRepository.setTaskUrl, model.id, undefined)
              ],
              callback
            );
          });
        } else {
          callback();
        }
      },
      function (callback) {
        analysisRepository.setProblem(analysisId, problem, callback);
      }
    ],
    _.partial(okCallback, response, next)
  );
}

function okCallback(response, next, error) {
  if (error) {
    next({
      statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      message: error
    });
  } else {
    response.sendStatus(statusCodes.OK);
  }
}

function jsonCallback(response, next, error, result) {
  if (error) {
    next({
      statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      message: error
    });
  } else {
    response.json(result);
  }
}

module.exports = {
  queryAnalyses: queryAnalyses,
  getAnalysis: getAnalysis,
  createAnalysis: createAnalysis,
  getProblem: getProblem,
  setPrimaryModel: setPrimaryModel,
  setTitle: setTitle,
  setOutcome: setOutcome,
  deleteAnalysis: deleteAnalysis,
  setProblem: setProblem
};
