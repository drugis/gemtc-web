var logger = require('./logger'),
  async = require('async'),
  modelRepository = require('./modelRepository'),
  pataviTaskRepository = require('./pataviTaskRepository'),
  analysisRepository = require('./analysisRepository'),
  status = require('http-status-codes'),
  _ = require('lodash')
;


module.exports = {
  getPataviTask: getPataviTask
};

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

function getPataviTask(request, response, next) {
  var modelId = request.params.modelId;
  var analysisId = request.params.analysisId;
  var modelSettings = ['linearModel', 'modelType'];

  var modelCache;
  var createdIdCache;
  async.waterfall([
      function(callback) {
        modelRepository.get(modelId, callback);
      },
      function(model, callback) {
        modelCache = model;
        if (model.taskId) {
          response.json({
            uri: process.env.PATAVI_URI + model.taskId
          });
          callback('stop');
        } else {
          analysisRepository.get(analysisId, callback);
        }
      },
      function(analysis, callback) {
        var problemPlusModelSettings = _.extend(analysis.problem, _.pick(modelCache, modelSettings));
        if(problemPlusModelSettings.modelType.type === 'pairwise') {
          problemPlusModelSettings = reduceToPairwiseProblem(problemPlusModelSettings);
        }
        pataviTaskRepository.create(problemPlusModelSettings, callback);
      },
      function(createdId, callback) {
        createdIdCache = createdId;
        modelRepository.setTaskId(modelCache.id, createdId, callback);
      },
      function() {
        response.json({
          uri: process.env.PATAVI_URI + createdIdCache
        });
      }
    ],
    function(error, callback) {
      if (error && error !== 'stop') {
        logger.error(error);
        response.sendStatus(status.INTERNAL_SERVER_ERROR);
        response.end();
      }
    });
}