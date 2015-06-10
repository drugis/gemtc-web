var logger = require('./logger');
var db = require('./db');

module.exports = {
  create: createModel
};

function createModel(ownerAccountId, analysisId, callback) {

  db.query('INSERT INTO model (analysisId) VALUES($1) RETURNING id', [
    analysisId
  ],
    function(error, result) {
      if (error) {
        logger.error('error creating model, error: ' + error);
      }
      callback(error, result.rows[0].id);
    });
}
