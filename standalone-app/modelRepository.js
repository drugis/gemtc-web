var logger = require('./logger');
var db = require('./db');

module.exports = {
  create: createModel,
  get: getModel
};

function createModel(ownerAccountId, analysisId, callback) {

  db.query('INSERT INTO model (analysisId) VALUES($1) RETURNING id', [
    analysisId
  ],
    function(error, result) {
      if (error) {
        logger.error('error creating model, error: ' + error);
        callback(error);
      } else {
        callback(error, result.rows[0].id);
      }
    });
}

function getModel(modelId, callback) {
  db.query('SELECT FROM model WHERE id=$1', [modelId], function(error, result) {
    if (error) {
      logger.error('error retrieving model, error: ' + error);
      callback(error)
    } else {
      callback(error, result.rows[0]);
    }
  })
}
