var express = require('express');
var analysesRepo = require('./analysesRepo');

var router = express.Router();

router
  .route('/analyses/:analysisId')
  .get(function(request, response, next) {
    if(request.params.analysisId) {
      analysesRepo.get(request.params.analysisId, function(err, analysis) {
        response.json(JSON.stringify(analysis[0]));
        next();
      });
    } else {
      analysesRepo.query(request.params.analysisId, function(analysis) {
        response.json(analysis);
        next();
      });
    }
  });

module.exports = router;
