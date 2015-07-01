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

    function createPairwiseOptions(analysisPromise) {
      return analysisPromise.then(function(analysis) {
        var network = transformProblemToNetwork(analysis.problem);
        var edgesWithMoreThanOneStudy = _.filter(network.edges, function(edge) {
          return edge.numberOfStudies > 1;
        });
        return addComparisonLabels(edgesWithMoreThanOneStudy);
      });
    }

    return {
      transformProblemToNetwork: transformProblemToNetwork,
      problemToStudyMap: problemToStudyMap,
      createPairwiseOptions: createPairwiseOptions
    };

  };

  return dependencies.concat(AnalysisService);
});
