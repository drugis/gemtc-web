'use strict';
var logger = require('./logger'),
  dbUtil = require('./dbUtil'),
  db = require('./db')(dbUtil.connectionConfig),
  _ = require('lodash');

module.exports = {
  create: createFunnelPlot,
  findByModelId: findByModelId,
  findByPlotId: findByPlotId
};


function aggregateRows(result) {
  logger.debug('aggregating ' + JSON.stringify(result));
  var plots = _.reduce(result, function(accum, row) {
    if (!accum[row.plotid]) {
      accum[row.plotid] = {
        id: row.plotid,
        modelId: row.modelid,
        includedComparisons: []
      };
    }
    accum[row.plotid].includedComparisons.push({
      t1: row.t1,
      t2: row.t2,
      biasDirection: row.biasdirection
    });
    return accum;
  }, {});
  return _.map(plots, _.identity); // from map to array
}

function createFunnelPlot(modelId, newFunnelPlot, callback) {
  var variableIndex = 1;
  var queryValues = newFunnelPlot.includedComparisons.reduce(function(accum, comparison) {
    //     new plot id                     modelId               treatment 1               treatment 2               bias direction
    var valueString = '((select * from newplotid),  $' + variableIndex++ + ', $' + variableIndex++ + ', $' + variableIndex++ + ', $' + variableIndex++ + ')';
    return {
      strings: accum.strings.concat(valueString),
      rows: accum.rows.concat([modelId, comparison.t1, comparison.t2, comparison.biasDirection])
    };
  }, {
    strings: [],
    rows: []
  });

  db.query(
    'WITH newplotid as (select nextval(\'funnelplot_plotid_seq\')) ' +
    'INSERT INTO funnelplot (plotid, modelId, t1, t2, biasDirection) VALUES ' +
    queryValues.strings.join(','),
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
    'SELECT plotId, modelId, t1, t2, biasDirection FROM funnelplot WHERE modelId = $1 ORDER BY plotId', [modelId],
    function(error, result) {
      if (error) {
        logger.error('error finding funnelplots by model id, error: ' + error);
        callback(error);
      } else {
        callback(null, aggregateRows(result.rows));
      }
    });
}

function findByPlotId(plotId, callback) {
  logger.debug('retrieving funnel plot ' + plotId);
  db.query(
    'SELECT plotId, modelId, t1, t2, biasDirection FROM funnelplot WHERE plotId = $1', [plotId],
    function(error, result) {
      if (error) {
        logger.error('error finding retrieving funnel plot, error: ' + error);
        callback(error);
      } else {
        callback(null, aggregateRows(result.rows)[0]);
      }
    });
}
