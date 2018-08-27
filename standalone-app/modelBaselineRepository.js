'use strict';
var logger = require('./logger'),
  dbUtil = require('./dbUtil'),
  db = require('./db')(dbUtil.connectionConfig);

module.exports = {
  set: setBaseline,
  get: getBaseline
};


function setBaseline(modelId, baseline, callback) {
  db.query(
    'insert into modelBaseline values($1, $2) ON CONFLICT(modelId) DO UPDATE SET baseline=$2', [modelId, baseline],
    callback
  );
}

function getBaseline(modelId, callback) {
  db.query(
    'SELECT modelId, baseline FROM modelBaseline WHERE modelId=$1', [modelId],
    function(error, result) {
      if (error) {
        logger.error('error retrieving model baseline, error: ' + error);
        callback(error);
      } else {
        logger.debug('ModelBaselineRepository.getBaseline return baseline = ' + JSON.stringify(result.rows[0]));
        callback(error, result.rows[0]);
      }
    });
}
