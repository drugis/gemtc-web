var logger = require('./logger');
var express = require('express');
var analysesRepo = require('./analysesRepo');
var status = require('http-status-codes');

module.exports = express.Router()
  .get('/', queryAnalyses)
  .get('/:analysisId', getAnalysis)
  .get('/:analysisId/problem', getProblem)
  .post('/', createAnalysis);

function queryAnalyses(request, response, next) {
  logger.debug('query analyses');
  analysesRepo.query(request.session.userId, function(error, result) {
    response.json(result.rows);
    next();
  });
}

function getAnalysis(request, response, next) {
  logger.debug('get analysis by id ' + request.params.analysisId);
  analysesRepo.get(request.params.analysisId, function(error, analyses) {
    var analysis = analyses.rows[0];
    analysis.problem = JSON.parse(analysis.problem);
    if(isAnalysisOwner(analysis, request.session.userId)) {
      response.json(analysis);
    } else{
      response.sendStatus(status.FORBIDDEN);
    }
    next();
  });
}

function createAnalysis(request, response, next) {
  logger.debug('create analysis: ' + JSON.stringify(request.body));
  analysesRepo.create(request.session.userId, request.body, function(error, created) {
    response.location('/analyses/' + created.rows[0].id);
    response.sendStatus(status.CREATED);
    next();
  });
}

function getProblem(request, response, next) {
  logger.debug('analysisRouter.getProblem');
  analysesRepo.get(request.params.analysisId, function(error, result) {
    response.json(result.rows[0].problem);
    next();
  });
}

function isAnalysisOwner(analysis, accountId) {
  return analysis.owner === accountId;
}
