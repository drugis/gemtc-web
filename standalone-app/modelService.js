'use strict';
var modelRepository = require('./modelRepository');
var _ = require('lodash');

function update(oldModel, newModel, callback) {
  if (newModel.burnInIterations < oldModel.burnInIterations ||
    newModel.inferenceIterations < oldModel.inferenceIterations) {
    var errorMessage = 'Error: may not update model with lower number of iterations';
    callback(errorMessage);
  } else {
    modelRepository.update(newModel, callback);
  }
}

function partitionModels(models) {
  var partition = _.partition(models, function(model) {
    return model.taskUrl !== null && model.taskUrl !== undefined;
  });
  return {
    modelsWithTask: partition[0],
    modelsWithoutTask: partition[1]
  };
}

function decorateWithRunStatus(models, pataviResult) {
  var tasks = _.keyBy(pataviResult, (result) => _.last(result.id.split('/')));
  return _.map(models, function(model) {
    return _.extend(model, {
      runStatus: tasks[_.last(model.taskUrl.split('/'))].runStatus
    });
  });
}

module.exports = {
  update: update,
  partitionModels: partitionModels,
  decorateWithRunStatus: decorateWithRunStatus
};
