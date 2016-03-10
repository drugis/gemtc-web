'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var AnalysisService = function() {

    var LIKELIHOOD_LINK_SETTINGS = [{
      likelihood: "normal",
      link: "identity",
      scale: "mean difference",
      analysisScale: "mean difference",
      absoluteScale: 'mean',
      columns: [
        ["mean", "std.err"],
        ["mean", "std.dev", "sampleSize"]
      ],
      missingColumnsLabel: "'mean' and 'std.err' or 'mean', 'std.err', and 'sampleSize'"
    }, {
      likelihood: "binom",
      link: "logit",
      scale: "odds ratio",
      analysisScale: "log odds ratio",
      absoluteScale: 'log odds',
      columns: [
        ["responders", "sampleSize"]
      ],
      missingColumnsLabel: "'responders' and 'sampleSize'"
    }, {
      likelihood: "binom",
      link: "log",
      scale: "risk ratio",
      analysisScale: "log risk ratio",
      absoluteScale: 'log risk',
      columns: [
        ["responders", "sampleSize"]
      ],
      missingColumnsLabel: "'responders' and 'sampleSize'"
    }, {
      likelihood: "binom",
      link: "cloglog",
      scale: "hazard ratio",
      analysisScale: "log hazard ratio",
      absoluteScale: 'log hazard',
      columns: [
        ["responders", "sampleSize"]
      ],
      missingColumnsLabel: "'responders' and 'sampleSize'"
    }, {
      likelihood: "poisson",
      link: "log",
      scale: "hazard ratio",
      analysisScale: "log hazard ratio",
      absoluteScale: 'log hazard',
      columns: [
        ["responders", "exposure"]
      ],
      missingColumnsLabel: "'responders' and 'exposure'"
    }];

    function problemToStudyMap(problemArg) {
      var problem = angular.copy(problemArg);
      var treatmentsMap = _.keyBy(problem.treatments, 'id');
      var studyMap = _.reduce(problem.entries, function(studies, entry) {
        if (!studies[entry.study]) {
          studies[entry.study] = {
            arms: {}
          };
        }
        studies[entry.study].arms[treatmentsMap[entry.treatment].name] = _.omit(entry, 'study', 'treatment');

        return studies;
      }, {});

      if (problem.relativeEffectData) {
        studyMap = _.reduce(problem.relativeEffectData.data, function(studies, study, studyName) {
          var studyEntry = {
            arms: {}
          };
          var baseArmName = treatmentsMap[study.baseArm.treatment].name;
          studyEntry.arms[baseArmName] = _.omit(study.baseArm, 'treatment');

          _.forEach(study.otherArms, function(arm) {
            var armName = treatmentsMap[arm.treatment].name;
            studyEntry.arms[armName] = _.omit(arm, 'treatment');
          });

          studies[studyName] = studyEntry;
          return studies;
        }, studyMap);
      }
      return studyMap;
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
        intervention.sampleSize = 0;
        if (!problem.relativeEffectData || !problem.relativeEffectData.data) {
          intervention.sampleSize = _.reduce(problem.entries, function(totalSampleSize, entry) {
            return entry.treatment === treatment.id ? totalSampleSize + entry.sampleSize : totalSampleSize;
          }, intervention.sampleSize);
        }
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
      var studies = _.uniqBy(entries, 'study');
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

    function reduceToPairwiseProblem(problem, from, to) {
      var filteredTreatments = filterPairwiseTreatments(problem.treatments, from.name, to.name);
      var filteredEntries = filterPairwiseEntries(problem.entries, problem.treatments);
      return {
        treatments: filteredTreatments,
        entries: filteredEntries
      };
    }

    function estimateRunLength(problem, model) {
      var theProblem, nRandomEffects, nStochasticVariables, nMonitoredVariables,
        modelType = model.modelType.type;
      if (modelType === 'pairwise') {
        theProblem = reduceToPairwiseProblem(problem, model.modelType.details.from, model.modelType.details.to);
      } else if (modelType === 'network' || modelType === 'node-split' || modelType === 'regression') {
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
      return _.some(nodesToVisit, function(nodeToVisit) {
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
        };
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

    function hasRelativeEffectData(problem) {
      return problem.relativeEffectData && problem.relativeEffectData.data;
    }

    function isSettingIncompatible(setting, problem) {
      return problem.entries.find(function(entry) {
        return _.every(setting.columns, function(columnNames) {
          return _.intersection(_.keys(entry), columnNames).length !== columnNames.length;
        });
      });
    }

    function createLikelihoodLinkOptions(problem) {
      return _.map(LIKELIHOOD_LINK_SETTINGS, function(setting) {
        var isIncompatible;
        if (hasRelativeEffectData(problem) && problem.relativeEffectData.scale) {
          isIncompatible = setting.analysisScale !== problem.relativeEffectData.scale || isSettingIncompatible(setting, problem);
        } else {
          isIncompatible = isSettingIncompatible(setting, problem);
        }

        var option = _.pick(setting, ['likelihood', 'link', 'scale', 'missingColumnsLabel', 'analysisScale']);
        option.label = option.likelihood + '/' + option.link + ' (' + option.scale + ')';
        option.compatibility = isIncompatible ? 'incompatible' : 'compatible';
        return option;
      });
    }

    function getScaleName(model) {
      return _.find(LIKELIHOOD_LINK_SETTINGS, function(setting) {
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
      getScaleName: getScaleName,
      LIKELIHOOD_LINK_SETTINGS: LIKELIHOOD_LINK_SETTINGS
    };

  };

  return dependencies.concat(AnalysisService);
});
