var logger = require('./logger');
var express = require('express');
var analysesRepo = require('./analysesRepo');

module.exports = express.Router()
  .get('/', queryAnalyses)
  .get('/:analysisId', getAnalysis);


function queryAnalyses(request, response, next) {
  logger.debug('query analyses');
  analysesRepo.query(request.session.userId, function(analyses) {
    response.json(analyses);
    next();
  });
}

function getAnalysis(request, response, next) {
  logger.debug('get analysis by id ' + request.params.analysisId);
  analysesRepo.get(request.params.analysisId, function(err, analysis) {
    response.json(JSON.stringify(analysis[0]));
    next();
  });
}