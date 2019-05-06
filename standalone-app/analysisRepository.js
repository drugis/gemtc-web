'use strict';
var logger = require('./logger'),
  dbUtil = require('./dbUtil'),
  db = require('./db')(dbUtil.connectionConfig);

function rowMapper(row) {
  row.primaryModel = row.primarymodel;
  delete row.primarymodel;
  return row;
}

function get(analysisId, callback) {
  db.query('SELECT * FROM analysis WHERE ID=$1',
    [analysisId], function(error, result) {
      if (error) {
        logger.error('error at db.get, error: ' + error);
        callback(error);
      } else {
        callback(error, rowMapper(result.rows[0]));
      }
    });
}

function query(ownerAccountId, callback) {
  logger.debug('get analyses for owner ' + ownerAccountId);
  db.query('SELECT id, owner, title, problem, outcome FROM analysis WHERE OWNER=$1',
    [ownerAccountId], function(error, result) {
      if (error) {
        logger.error('error at db.query, error: ' + error);
        callback(error);
      } else {
        callback(error, result);
      }
    });
}

function create(ownerAccountId, newAnalysis, callback) {
  db.query('INSERT INTO analysis (title, outcome, problem, owner) VALUES($1, $2, $3, $4) RETURNING id',
    [newAnalysis.title,
    newAnalysis.outcome,
    newAnalysis.problem,
      ownerAccountId
    ], function(error, result) {
      if (error) {
        logger.error('error creating analysis, error: ' + error);
        callback(error);
      } else {
        var newAnalysisId = result.rows[0].id;
        callback(error, newAnalysisId);
      }
    });
}

function setPrimaryModel(analysisId, primaryModelId, callback) {
  logger.debug('setPrimaryModel');
  var statement = 'UPDATE analysis SET primaryModel = $1 where id = $2';
  db.query(statement, [primaryModelId, analysisId],
    function(error) {
      logger.debug('setPrimaryModel result');
      if (error) {
        logger.error('error setting primaryModel, error: ' + error);
        callback(error);
      } else {
        callback();
      }
    });
}

function setTitle(analysisId, newTitle, callback) {
  logger.debug('setTitle');
  db.query('UPDATE analysis SET title = $1 WHERE id = $2', [newTitle, analysisId],
    (error) => {
      if (error) {
        logger.error('error occured changing analysis title: ' + error);
        callback(error);
      } else {
        callback();
      }
    });
}

function setOutcome(analysisId, newOutcome, callback) {
  logger.debug('setOutcome');
  db.query('UPDATE analysis SET outcome = $1 WHERE id = $2', [newOutcome, analysisId],
    (error) => {
      if (error) {
        logger.error('error occured while setting the outcome: ' + error);
        callback(error);
      } else {
        callback();
      }
    });
}

module.exports = {
  get: get,
  query: query,
  create: create,
  setPrimaryModel: setPrimaryModel,
  setTitle: setTitle,
  setOutcome: setOutcome
};
