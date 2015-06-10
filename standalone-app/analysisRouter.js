var logger = require('./logger');
var express = require('express');
var analysisRepository = require('./analysisRepository');
var modelRouter = require('./modelRouter');
var status = require('http-status-codes');

module.exports = express.Router()
  .get('/', queryAnalyses)
  .get('/:analysisId', getAnalysis)
  .get('/:analysisId/problem', getProblem)
  .post('/', createAnalysis)
  .use('/:analysisId/models', modelRouter)
  ;

function queryAnalyses(request, response, next) {
  logger.debug('query analyses');
  analysisRepository.query(request.session.userId, function(error, result) {
    if (error) {
      logger.error(error);
      response.sendStatus(status.INTERNAL_SERVER_ERROR);
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
      response.sendStatus(status.INTERNAL_SERVER_ERROR);
     response.end();
    } else {
      if (isAnalysisOwner(analysis, request.session.userId)) {
        response.json(analysis);
      } else {
        response.sendStatus(status.FORBIDDEN);
      }
      next();
    }
  });
}

function createAnalysis(request, response, next) {
  logger.debug('create analysis: ' + JSON.stringify(request.body));
  logger.debug('request.session.userId: ' + request.session.userId);
  analysisRepository.create(request.session.userId, request.body, function(error, newAnalysis) {
    if (error) {
      logger.error(error);
      response.sendStatus(status.INTERNAL_SERVER_ERROR);
      response.end();
    } else {
      response.location('/analyses/' + newAnalysis.id);
      response.sendStatus(status.CREATED);
      next();
    }
  });
}

function getProblem(request, response, next) {
  logger.debug('analysisRouter.getProblem');
  analysisRepository.get(request.params.analysisId, function(error, result) {
    response.json(result.rows[0].problem);
    next();
  });
}

function isAnalysisOwner(analysis, accountId) {
  return analysis.owner === accountId;
}
