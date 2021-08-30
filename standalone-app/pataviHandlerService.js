'use strict';
var pataviTaskRepository = require('./pataviTaskRepository'),
  _ = require('lodash');

module.exports = {
  createPataviTask: createPataviTask
};

var modelSettings = [
  'linearModel',
  'modelType',
  'burnInIterations',
  'inferenceIterations',
  'thinningFactor',
  'likelihood',
  'link',
  'outcomeScale',
  'heterogeneityPrior',
  'regressor',
  'sensitivity'
];

function createPataviTask(analysis, model, callback) {
  var problemPlusModelSettings = _.extend(
    analysis.problem,
    _.pick(model, modelSettings)
  );
  problemPlusModelSettings.preferredDirection = analysis.outcome.direction || 1; // 1 ( higher is better as default)
  if (
    problemPlusModelSettings.sensitivity &&
    problemPlusModelSettings.sensitivity.omittedStudy
  ) {
    problemPlusModelSettings = leaveStudyOut(problemPlusModelSettings);
  }
  pataviTaskRepository.create(
    problemPlusModelSettings,
    'service=gemtc',
    callback
  );
}

function leaveStudyOut(problemPlusSettings) {
  problemPlusSettings.entries = _.filter(
    problemPlusSettings.entries,
    function (entry) {
      return entry.study !== problemPlusSettings.sensitivity.omittedStudy;
    }
  );
  return problemPlusSettings;
}
