var logger = require('./logger'),
  dbUtil = require('./dbUtil'),
  _ = require('lodash'),
  db = require('./db')(dbUtil.buildGemtcDBUrl()),
  columnString = 'title, analysisId, linearModel, burn_in_iterations, inference_iterations, ' +
    ' thinning_factor, modelType, likelihood, link, outcome_scale, heterogeneity_prior, regressor';

module.exports = {
  create: createModel,
  get: getModel,
  update: update,
  findByAnalysis: findByAnalysis,
  setTaskId: setTaskId
};

function mapModelRow(modelRow) {
  var model = {
    id: modelRow.id,
    title: modelRow.title,
    linearModel: modelRow.linearmodel,
    analysisId: modelRow.analysisid,
    taskId: modelRow.taskid,
    modelType: modelRow.modeltype,
    burnInIterations: modelRow.burn_in_iterations,
    inferenceIterations: modelRow.inference_iterations,
    thinningFactor: modelRow.thinning_factor,
    likelihood: modelRow.likelihood,
    link: modelRow.link,
    heterogeneityPrior: modelRow.heterogeneity_prior,
    regressor: modelRow.regressor
  };

  if (modelRow.outcome_scale) {
    model.outcomeScale = modelRow.outcome_scale;
  }

  return model;
}

function findByAnalysis(analysisId, callback) {
  logger.debug('modelRepository.findByAnalysis, where analysisId = ' + analysisId);
  db.query(
    ' SELECT id, taskId, ' + columnString + 
    ' FROM model WHERE analysisId=$1', [analysisId], function(error, result) {
      if (error) {
        logger.error('error finding models by analysisId, error: ' + error);
        callback(error);
      } else {
        logger.debug('find models by analysisId completed, result = ' + JSON.stringify(result.rows));
        callback(error, _.map(result.rows, mapModelRow));
      }
    });
}

function createModel(ownerAccountId, analysisId, newModel, callback) {

  db.query(
    ' INSERT INTO model (' + columnString + ') ' +
    ' VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id', [
      newModel.title,
      analysisId,
      newModel.linearModel,
      newModel.burnInIterations,
      newModel.inferenceIterations,
      newModel.thinningFactor,
      newModel.modelType,
      newModel.likelihood,
      newModel.link,
      newModel.outcomeScale,
      newModel.heterogeneityPrior,
      newModel.regressor
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
  db.query(
    ' SELECT id, taskId, ' + columnString +
    ' FROM model WHERE id=$1', [modelId], function(error, result) {
    if (error) {
      logger.error('error retrieving model, error: ' + error);
      callback(error);
    } else {
      logger.debug('ModelRepository.getModel return model = ' + JSON.stringify(result.rows[0]));
      callback(error, mapModelRow(result.rows[0]));
    }
  });
}

function setTaskId(modelId, taskId, callback) {
  db.query('UPDATE model SET taskId=$2 WHERE id = $1', [modelId, taskId], function(error, result) {
    if (error) {
      logger.error('error retrieving model, error: ' + error);
      callback(error);
    } else {
      callback();
    }
  });
}

function update(newModel, callback) {
  db.query('UPDATE model SET burn_in_iterations=$2, inference_iterations=$3, thinning_factor=$4, taskid=NULL where id = $1', [
    newModel.id,
    newModel.burnInIterations,
    newModel.inferenceIterations,
    newModel.thinningFactor
  ], function(error, result) {
    if (error) {
      logger.error('error retrieving model, error: ' + error);
      callback(error);
    } else {
      callback();
    }
  });
}
