'use strict';
var logger = require('./logger'),
  dbUtil = require('./dbUtil'),
  db = require('./db')(dbUtil.gemtcDBUrl);

function rowMapper(row) {
  row.primaryModel = row.primarymodel;
  delete row.primarymodel;
  return row;
}

function getAnalysis(analysisId, callback) {
  db.query('SELECT * FROM analysis WHERE ID=$1', [analysisId], function(error, result) {
    if (error) {
      logger.error('error at db.get, error: ' + error);
    }
    callback(error, rowMapper(result.rows[0]));
  });
}

function queryAnalyses(ownerAccountId, callback) {
  logger.debug('get analyses for owner ' + ownerAccountId);
  db.query('SELECT id, owner, title, problem, outcome FROM analysis WHERE OWNER=$1', [ownerAccountId], function(error, result) {
    if (error) {
      logger.error('error at db.query, error: ' + error);
    }
    callback(error, result);
  });
}

function createAnalysis(ownerAccountId, newAnalysis, callback) {
  db.query('INSERT INTO analysis (title, outcome, problem, owner) VALUES($1, $2, $3, $4) RETURNING id', [newAnalysis.title,
    newAnalysis.outcome,
    newAnalysis.problem,
    ownerAccountId
  ], function(error, result) {
    if (error) {
      logger.error('error creating analysis, error: ' + error);
    }
    newAnalysis.id = result.rows[0].id;
    callback(error, newAnalysis);
  });
}

function setPrimaryModel(analysisId, primaryModelId, callback) {
  //logger.debug('analysisRepository.setPrimaryModel with analysisId = ' + analysisId + ' primaryModelId = ' + primaryModelId);
  logger.debug('setPrimaryModel');
  var statement = 'UPDATE analysis SET primaryModel = $1 where id = $2';
  db.query(statement, [primaryModelId, analysisId],
    function(error) {
      logger.debug('setPrimaryModel result');
      if (error) {
        logger.error('error setting primaryModel, error: ' + error);
        callback(error);
      }
      logger.debug('do call back');
      callback();
    });
}

module.exports = {
  get: getAnalysis,
  query: queryAnalyses,
  create: createAnalysis,
  setPrimaryModel: setPrimaryModel
};
