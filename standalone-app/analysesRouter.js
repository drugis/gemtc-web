var logger = require('./logger');
var express = require('express');
var analysesRepo = require('./analysesRepo');

var router = express.Router();

router
  .get('/', function(request, response, next) {
    logger.debug('get id-less analyses');
    analysesRepo.query(request.session.auth.google.user.id, function(analyses) {
      response.json(analysis);
      next();
    });
  })
  .get('/:analysisId', function(request, response, next) {
    logger.debug('get analysis with id ' + request.params.analysisId);
    analysesRepo.get(request.params.analysisId, function(err, analysis) {
      response.json(JSON.stringify(analysis[0]));
      next();
    });
  });
;


module.exports = router;
