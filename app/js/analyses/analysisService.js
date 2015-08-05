'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var AnalysisService = function() {

    var likelihoodLinkSettings = [{
      "likelihood": "normal",
      "link": "identity",
      "scale": "mean difference",
      "columns": [
        ["mean", "std.err"],
        ["mean", "std.dev", "sampleSize"]
      ],
      "missingColumnsLabel": "mean and std.err or mean, std.err and sampleSize"
    }, {
      "likelihood": "binom",
      "link": "logit",
      "scale": "odds ratio",
      "columns": [
        ["responders", "sampleSize"]
      ],
      "missingColumnsLabel": "responders and sampleSize"
    }, {
      "likelihood": "binom",
      "link": "log",
      "scale": "risk ratio",
      "columns": [
        ["responders", "sampleSize"]
      ],
      "missingColumnsLabel": "responders and sampleSize"
    }, {
      "likelihood": "binom",
      "link": "cloglog",
      "scale": "hazard ratio",
      "columns": [
        ["responders", "sampleSize"]
      ],
      "missingColumnsLabel": "responders and sampleSize"
    }, {
      "likelihood": "poisson",
      "link": "log",
      "scale": "hazard ratio",
      "columns": [
        ["responders", "exposure"]
      ],
      "missingColumnsLabel": "responders and exposure"
    }];

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

    function findStudiesMeasuringEdge(edge, studyMap) {
      return _.reduce(studyMap, function(studiesMeasuringEdge, study, studyKey) {
        if (study.arms[edge.to.name] && study.arms[edge.from.name]) {
          study.title = studyKey;
          studiesMeasuringEdge.push(study);
        }
        return studiesMeasuringEdge;
      }, []);
    }

    function transformProblemToNetwork(problem) {

      var network = {};

      function treatmentToIntervention(treatment) {
        var intervention = {};
        intervention.name = treatment.name;
        intervention.id = treatment.id;
        intervention.sampleSize = _.reduce(problem.entries, function(totalSampleSize, entry) {
          return entry.treatment === treatment.id ? totalSampleSize + entry.sampleSize : totalSampleSize;
        }, 0);
        return intervention;
      }

      network.interventions = _.map(problem.treatments, treatmentToIntervention);

      network.edges = generateEdges(network.interventions);
      var studyMap = problemToStudyMap(problem);
      network.edges = _.map(network.edges, function(edge) {
        edge.studies = findStudiesMeasuringEdge(edge, studyMap);
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

    function createPairwiseOptions(problem) {
      var network = transformProblemToNetwork(problem);
      var edgesWithMoreThanOneStudy = _.filter(network.edges, function(edge) {
        return edge.studies.length > 1;
      });
      return addComparisonLabels(edgesWithMoreThanOneStudy);
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

    function reduceToPairwiseProblem(problem, pairwiseComparison) {
      var filteredTreatments = filterPairwiseTreatments(problem.treatments, pairwiseComparison.from.name, pairwiseComparison.to.name);
      var filteredEntries = filterPairwiseEntries(problem.entries, problem.treatments);
      return {
        treatments: filteredTreatments,
        entries: filteredEntries
      };
    }

    function estimateRunLength(problem, model) {
      var theProblem, nRandomEffects, nStochasticVariables, nMonitoredVariables,
        modelMainType = model.modelType.mainType;
      if (modelMainType === 'pairwise') {
        theProblem = reduceToPairwiseProblem(problem, model.pairwiseComparison);
      } else if (modelMainType === 'network' || modelMainType === 'node-split') {
        theProblem = problem;
      }
      var nTreatments = theProblem.treatments.length;

      if (model.linearModel === 'random') {
        nRandomEffects = countRandomEffects(theProblem.entries);
        nStochasticVariables = nRandomEffects + nTreatments + 1;
        nMonitoredVariables = nTreatments + 1;
      } else if (model.linearModel === 'fixed') {
        nStochasticVariables = nTreatments;
        nMonitoredVariables = nTreatments;
      }
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

    function hasIndirectPath(startNode, currentNode, network, path) {
      var reachableNodes = _.reduce(network.edges, function(accum, edge) {
        if (edge.from.name === currentNode.name) {
          accum.push(edge.to);
        } else if (edge.to.name === currentNode.name) {
          accum.push(edge.from);
        }
        return accum;
      }, []);

      // if there is a cycle -> indirect path
      if (path.length > 1 && _.find(reachableNodes, function(node) {
          return node.name === startNode.name;
        })) {
        return true;
      }

      // remove already-visited nodes
      var nodesToVisit = _.filter(reachableNodes, function(node) {
        return !_.find(path, function(pathNode) {
          return pathNode.name === node.name;
        });
      });

      // check connected nodes
      return _.any(nodesToVisit, function(nodeToVisit) {
        return hasIndirectPath(startNode, nodeToVisit, network, path.concat(currentNode));
      });
    }

    function removeStudiesFromNetwork(studiesToRemove, network) {
      var strippedEdges = _.map(network.edges, function(edge) {
        return {
          from: edge.from,
          to: edge.to,
          studies: _.filter(edge.studies, function(study) {
            return !_.find(studiesToRemove, function(studyToRemove) {
              return study.title === studyToRemove.title;
            });
          })
        }
      });
      return {
        edges: strippedEdges,
        interventions: network.interventions
      };
    }

    function getNonEmptyEdges(network) {
      return _.filter(network.edges, function(edge) {
        return edge.studies.length > 0;
      });
    }

    // find edges that have both a direct and indirect comparison;
    // a direct comparison is an edge A-B with at least one study.
    // an indirect comparison means that there is a path from A to B that is not the edge A-B
    function createNodeSplitOptions(problem) {
      var network = transformProblemToNetwork(problem);

      network.edges = getNonEmptyEdges(network);

      return addComparisonLabels(_.filter(network.edges, function(edge) {
        var strippedNetwork = removeStudiesFromNetwork(edge.studies, network);
        strippedNetwork.edges = getNonEmptyEdges(strippedNetwork);

        return hasIndirectPath(edge.from, edge.to, strippedNetwork, [edge.from]);
      }));
    }

    function createLikelihoodLinkOptions(problem) {
      return _.map(likelihoodLinkSettings, function(setting) {
        var isCompatible = _.any(setting.columns, function(columns) {
          return _.every(columns, function(columnName) {
            return problem.entries[0].hasOwnProperty(columnName);
          });
        });

        var option = _.pick(setting, ['likelihood', 'link', 'scale', 'missingColumnsLabel']);
        option.label = option.likelihood + '/' + option.link + ' (' + option.scale + ')';
        option.compatibility = isCompatible ? 'compatible' : 'incompatible';
        return option;
      });
    }

    function getScaleName(model) {
      return _.find(likelihoodLinkSettings, function(setting) {
        return setting.likelihood === model.likelihood &&
          setting.link === model.link;
      }).scale;
    }

    return {
      transformProblemToNetwork: transformProblemToNetwork,
      problemToStudyMap: problemToStudyMap,
      createPairwiseOptions: createPairwiseOptions,
      generateEdges: generateEdges,
      estimateRunLength: estimateRunLength,
      createNodeSplitOptions: createNodeSplitOptions,
      createLikelihoodLinkOptions: createLikelihoodLinkOptions,
      getScaleName: getScaleName
    };

  };

  return dependencies.concat(AnalysisService);
});