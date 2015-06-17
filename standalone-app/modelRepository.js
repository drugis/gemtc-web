var logger = require('./logger');
var db = require('./db')(process.env.GEMTC_DB_URL);

module.exports = {
  create: createModel,
  get: getModel,
  findByAnalysis: findByAnalysis
};

function findByAnalysis(analysisId, callback) {
  logger.debug('modelRepository.findByAnalysis, where analysisId = ' + analysisId);
  db.query('SELECT * FROM model WHERE analysisId=$1', [analysisId], function(error, result) {
    if (error) {
      logger.error('error finding models by analysisId, error: ' + error);
      callback(error)
    } else {
      logger.debug('find models by analysisId completed, result = ' + JSON.stringify(result.rows));
      callback(error, result.rows);
    }
  });
}

function createModel(ownerAccountId, analysisId, newModel, callback) {

  db.query('INSERT INTO model (analysisId, title) VALUES($1, $2) RETURNING id', [
      analysisId,
      newModel.title
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
  db.query('SELECT * FROM model WHERE id=$1', [modelId], function(error, result) {
    if (error) {
      logger.error('error retrieving model, error: ' + error);
      callback(error)
    } else {
      callback(error, result.rows[0]);
    }
  })
}
