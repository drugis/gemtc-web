var
  pataviTaskRepository = require('./pataviTaskRepository'),
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
  'outcomeScale'];

function createPataviTask(analysis, model, callback) {
  var problemPlusModelSettings = _.extend(analysis.problem, _.pick(model, modelSettings));
  if (problemPlusModelSettings.modelType.type === 'pairwise') {
    problemPlusModelSettings = reduceToPairwiseProblem(problemPlusModelSettings);
  }
  pataviTaskRepository.create(problemPlusModelSettings, callback);
}

function filterPairwiseTreatments(treatments, fromName, toName) {
  return _.filter(treatments, function(treatment) {
    return treatment.name === fromName || treatment.name === toName;
  });
}

function filterPairwiseEntries(entries, treatments) {
  return _.filter(entries, function(entry) {
    return entry.treatment === treatments[0].id ||
      entry.treatment === treatments[1].id;
  });
}

function reduceToPairwiseProblem(problem) {
  problem.treatments = filterPairwiseTreatments(problem.treatments,
    problem.modelType.details.from.name,
    problem.modelType.details.to.name);
  problem.entries = filterPairwiseEntries(problem.entries, problem.treatments);
  return problem;
}
