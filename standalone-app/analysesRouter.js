var logger = require('./logger');
var express = require('express');
var analysesRepo = require('./analysesRepo');
var status = require('http-status-codes');

module.exports = express.Router()
  .get('/', queryAnalyses)
  .get('/:analysisId', getAnalysis)
  .post('/', createAnalysis);


function queryAnalyses(request, response, next) {
  logger.debug('query analyses');
  analysesRepo.query(request.session.userId, function(error, analyses) {
    response.json(analyses);
    next();
  });
}

function getAnalysis(request, response, next) {
  logger.debug('get analysis by id ' + request.params.analysisId);
  analysesRepo.get(request.params.analysisId, function(error, analysis) {
    response.json(JSON.stringify(analysis[0]));
    next();
  });
}

function createAnalysis(request, response, next) {
  logger.debug('create analysis: ' + JSON.stringify(request.body));
  analysesRepo.create(request.session.userId, request.body, function(error, analysis) {
    response.sendStatus(status.CREATED);
    next();
  });
}
