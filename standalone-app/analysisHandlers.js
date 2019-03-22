'use strict';
var logger = require('./logger');
var analysisRepository = require('./analysisRepository');
var statusCodes = require('http-status-codes');

function queryAnalyses(request, response, next) {
  logger.debug('query analyses');
  analysisRepository.query(request.user.id, function(error, result) {
    if (error) {
      logger.error(error);
      response.sendStatus(statusCodes.INTERNAL_SERVER_ERROR);
      response.end();
    } else {
      response.json(result.rows);
      next();
    }
  });
}

function getAnalysis(request, response, next) {
  logger.debug('get analysis by id ' + request.params.analysisId);
  analysisRepository.get(request.params.analysisId, function(error, analysis) {
    if (error) {
      logger.error(error);
      response.sendStatus(statusCodes.INTERNAL_SERVER_ERROR);
      response.end();
    } else {
      response.json(analysis);
      next();
    }
  });
}

function createAnalysis(request, response, next) {
  logger.debug('create analysis: ' + JSON.stringify(request.body));
  logger.debug('request.user.id: ' + request.user.id);
  analysisRepository.create(request.user.id, request.body, function(error, newAnalysis) {
    if (error) {
      logger.error(error);
      response.sendStatus(statusCodes.INTERNAL_SERVER_ERROR);
      response.end();
    } else {
      response.location('/analyses/' + newAnalysis.id);
      response.sendStatus(statusCodes.CREATED);
      next();
    }
  });
}

function getProblem(request, response, next) {
  logger.debug('analysisRouter.getProblem');
  analysisRepository.get(request.params.analysisId, function(error, result) {
    response.json(result.problem);
    next();
  });
}

function setPrimaryModel(request, response, next) {
  logger.info('analysisRouter.setPrimaryModel');
  var analysisId = request.params.analysisId;
  var modelId = request.query.modelId;
  analysisRepository.setPrimaryModel(analysisId, modelId, function(error) {
    if (error) {
      logger.error(error);
      response.sendStatus(statusCodes.INTERNAL_SERVER_ERROR);
      response.end();
    }
    response.sendStatus(statusCodes.OK);
    next();
  });
}

module.exports = {
  queryAnalyses: queryAnalyses,
  getAnalysis: getAnalysis,
  createAnalysis: createAnalysis,
  getProblem: getProblem,
  setPrimaryModel: setPrimaryModel
};
