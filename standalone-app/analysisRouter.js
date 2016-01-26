var express = require('express');
var analysisHandlers = require('./analysisHandlers');
var modelRouter = require('./modelRouter');

module.exports = express.Router()
  .get('/', analysisHandlers.queryAnalyses)
  .get('/:analysisId', analysisHandlers.getAnalysis)
  .get('/:analysisId/problem', analysisHandlers.getProblem)
  .post('/:analysisId/setPrimaryModel', analysisHandlers.setPrimaryModel)
  .post('/', analysisHandlers.createAnalysis)
;
