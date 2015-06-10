var logger = require('./logger');
var express = require('express');
var analysisRepository = require('./analysisRepository');
var modelRepository = require('./modelRepository');
var status = require('http-status-codes');

module.exports = express.Router({
  mergeParams: true
})
  .post('/', createModel)
;


function createModel(request, response, next) {
  logger.debug('create model.');
  var analysisId = request.params.analysisId;
  var userId = request.session.userId;
  analysisRepository.get(analysisId, function(error, analysis) {
    if (error) {
      logger.error(error);
      response.sendStatus(status.INTERNAL_SERVER_ERROR);
      response.end();
    } else {
      logger.debug('check owner with ownerId = ' + analysis.owner + ' and userId = ' + userId);
      if (analysis.owner !== userId) {
        response.sendStatus(status.FORBIDDEN);
        response.end();
      } else {
        modelRepository.create(userId, analysisId, function(error, createdId) {
          if (error) {
            logger.error(error);
            response.sendStatus(status.INTERNAL_SERVER_ERROR);
            response.end();
          } else {
            response.location('/analyses/' + analysisId + '/models/' + createdId);
            response.sendStatus(status.CREATED);
            next();
          }
        });
      }
    }
  });

}
