'use strict';
var logger = require('./logger'),
  dbUtil = require('./dbUtil'),
  db = require('./db')(dbUtil.gemtcDBUrl);

module.exports = {
  create: createFunnelPlot,
  findByModelId: findByModelId
};

function mapRow(row) {
  return {
    modelId: row.modelid,
    t1: row.t1,
    t2: row.t2
  };
}

function createFunnelPlot(modelId, newFunnelPlot, callback) {
  var variableIndex = 1;
  var queryValues = newFunnelPlot.includedComparisons.reduce(function(accum, comparison) {
    return { // modelId             treatment 1             treatment 2
      strings: accum.strings.concat('($' + variableIndex++ + ', $' + variableIndex++ + ', $' + variableIndex++ + ')'),
      rows: accum.rows.concat([modelId, comparison.t1, comparison.t2])
    };
  }, {
    strings: [],
    rows: []
  });

  db.query(
    'INSERT INTO funnelplot (modelId, t1, t2) VALUES ' + queryValues.strings.join(','),
    queryValues.rows,
    function(error) {
      if (error) {
        logger.error('error creating funnelplot: ' + error);
        callback(error);
      } else {
        logger.debug('created funnelplot');
        callback();
      }
    }
  );
}

function findByModelId(modelId, callback) {
  logger.debug('finding funnel plots for model ' + modelId);
  db.query(
    'SELECT modelId, t1, t2 FROM funnel_plot WHERE modelId = $1', [modelId],
    function(error, result){
      if(error) {
        logger.error('error finding funnelplots by model id, error: ' + error);
        callback(error);
      } else {
        callback(null, result.map(mapRow));
      }
    });
}
