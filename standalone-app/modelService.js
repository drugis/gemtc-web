'use strict';
var modelRepository = require('./modelRepository');

module.exports = {
  update: update
};

function update(oldModel, newModel, callback) {
  if (newModel.burnInIterations < oldModel.burnInIterations ||
    newModel.inferenceIterations < oldModel.inferenceIterations) {
    callback({
      statusCode: 500,
      message: 'may not update model with lower number of iterations'
    });
  } else {
    modelRepository.update(newModel, callback);
  }
}
