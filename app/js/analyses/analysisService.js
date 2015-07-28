'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var AnalysisService = function() {

    function problemToStudyMap(problemArg) {
      var problem = angular.copy(problemArg);
      var treatmentsMap = _.indexBy(problem.treatments, 'id');
      return _.reduce(problem.entries, function(studies, entry) {
        if (!studies[entry.study]) {
          studies[entry.study] = {
            arms: {}
          };
        }
        entry.treatment = treatmentsMap[entry.treatment];
        studies[entry.study].arms[entry.treatment.name] = _.omit(entry, 'study', 'treatment');

        return studies;
      }, {});
    }


    function generateEdges(interventions) {
      var edges = [];
      _.each(interventions, function(rowIntervention, index) {
        var rest = interventions.slice(index + 1, interventions.length);
        _.each(rest, function(colIntervention) {
          edges.push({
            from: rowIntervention,
            to: colIntervention
          });
        });
      });

      return edges;
    }

    function countStudiesMeasuringEdge(edge, studyMap) {
      return _.reduce(studyMap, function(numberOfStudiesMeasuringEdge, study) {
        if (study.arms[edge.to.name] && study.arms[edge.from.name]) {
          numberOfStudiesMeasuringEdge += 1;
        }
        return numberOfStudiesMeasuringEdge;
      }, 0);
    }

    function transformProblemToNetwork(problem) {

      var network = {};

      function treatmentToIntervention(treatment) {
        var intervention = {};
        intervention.name = treatment.name;
        intervention.sampleSize = _.reduce(problem.entries, function(totalSampleSize, entry) {
          return entry.treatment === treatment.id ? totalSampleSize + entry.sampleSize : totalSampleSize;
        }, 0);
        return intervention;
      }

      network.interventions = _.map(problem.treatments, treatmentToIntervention);

      // edge.from.name, edge.to.name, edge.numberOfStudies
      network.edges = generateEdges(network.interventions);
      var studyMap = problemToStudyMap(problem);
      network.edges = _.map(network.edges, function(edge) {
        edge.numberOfStudies = countStudiesMeasuringEdge(edge, studyMap);
        return edge;
      });
      return network;
    }

    function addComparisonLabels(edges) {
      return _.map(edges, function(edge) {
        return _.extend(edge, {
          label: edge.from.name + ' - ' + edge.to.name
        });
      });
    }

    function createPairwiseOptions(problemPromise) {
      return problemPromise.then(function(problem) {
        var network = transformProblemToNetwork(problem);
        var edgesWithMoreThanOneStudy = _.filter(network.edges, function(edge) {
          return edge.numberOfStudies > 1;
        });
        return addComparisonLabels(edgesWithMoreThanOneStudy);
      });
    }

    function countRandomEffects(entries) {
      // sum of number of arms minus number of studies
      var studies = _.uniq(entries, function(entry) {
        return entry.study;
      });
      return entries.length - studies.length;
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

    function reduceToPairwiseProblem(problem, details) {
      problem.treatments = filterPairwiseTreatments(problem.treatments, details.from, details.to);
      problem.entries = filterPairwiseEntries(problem.entries, problem.treatments);
      return problem;
    }

    function estimateRunLength(problem, model) {
      var theProblem;
      if (model.modelType.type === 'pairwise') {
        theProblem = reduceToPairwiseProblem(problem,
          model.modelType.details)
      } else if (model.modelType.type === 'network') {
        theProblem = problem;
      }
      var nTreatments = problem.treatments.length;
      var nRandomEffects = countRandomEffects(problem.entries);
      var nStochasticVariables = nRandomEffects + nTreatments + 1;
      var nMonitoredVariables = nTreatments + 1;
      var fromMills = 0.001;
      var actualIterations = model.inferenceIterations / model.thinningFactor;

      var sampleTime = 0.032 * nStochasticVariables * fromMills * (model.burnInIterations + model.inferenceIterations);
      var summaryTime = 0.0075 * nMonitoredVariables * fromMills * actualIterations;
      var relativeEffectTime = 0.0075 * nTreatments * (nTreatments - 1) / 2 * fromMills * actualIterations;
      var relativeEffectPlotsTime = 0.0075 * nTreatments * (nTreatments - 1) * fromMills * actualIterations;
      var forestPlotTime = 0.1;
      var psrfPlotsTime = (0.04 + 0.007 * nMonitoredVariables) * fromMills * actualIterations;
      var tracePlotsTime = 0.062 * nMonitoredVariables * fromMills * actualIterations;
      return sampleTime + summaryTime + relativeEffectTime + relativeEffectPlotsTime + forestPlotTime + psrfPlotsTime + tracePlotsTime;
    }

    return {
      transformProblemToNetwork: transformProblemToNetwork,
      problemToStudyMap: problemToStudyMap,
      createPairwiseOptions: createPairwiseOptions,
      generateEdges: generateEdges,
      estimateRunLength: estimateRunLength
    };

  };

  return dependencies.concat(AnalysisService);
});
