'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var ModelService = function() {

    function findPrimaryModel(analysis, models) {
      return models.find(function(model) {
        return model.id === analysis.primaryModel;
      });
    }

    function cleanModel(frontEndModel) {
      var model = _.cloneDeep(frontEndModel);
      if (frontEndModel.modelType.mainType === 'node-split') {
        model.modelType.details = {
          from: _.omit(frontEndModel.nodeSplitComparison.from, 'sampleSize'),
          to: _.omit(frontEndModel.nodeSplitComparison.to, 'sampleSize')
        };
      }
      if (frontEndModel.modelType.mainType === 'pairwise') {
        model.modelType.details = {
          from: _.omit(frontEndModel.pairwiseComparison.from, 'sampleSize'),
          to: _.omit(frontEndModel.pairwiseComparison.to, 'sampleSize')
        };
      }
      if (frontEndModel.modelType.mainType === 'regression') {
        model.regressor = {
          variable: frontEndModel.covariateOption,
          coefficient: frontEndModel.treatmentInteraction,
          control: frontEndModel.metaRegressionControl.id.toString()
        };
        model.regressor.levels = frontEndModel.levels;
        delete model.covariateOption;
        delete model.metaRegressionControl;
        delete model.treatmentInteraction;
        delete model.levels;
      }
      model.modelType = _.omit(model.modelType, 'mainType', 'subType');
      model.modelType.type = frontEndModel.modelType.mainType;
      if (frontEndModel.likelihoodLink) {
        model.likelihood = frontEndModel.likelihoodLink.likelihood;
        model.link = frontEndModel.likelihoodLink.link;
      }

      if (frontEndModel.outcomeScale) {
        if (frontEndModel.outcomeScale.type === 'heuristically') {
          delete model.outcomeScale;
        } else {
          model.outcomeScale = frontEndModel.outcomeScale.value;
        }
      }

      if (model.heterogeneityPrior && model.heterogeneityPrior.type === 'automatic') {
        delete model.heterogeneityPrior;
      }

      if (model.leaveOneOut.isSelected) {
        if (!model.sensitivity) {
          model.sensitivity = {};
        }
        model.sensitivity.omittedStudy = model.leaveOneOut.omittedStudy;
      }
      model = _.omit(model, 'pairwiseComparison', 'nodeSplitComparison', 'likelihoodLink', 'leaveOneOut');
      return model;
    }

    function toFrontEnd(model) {
      var frontEndModel = _.cloneDeep(model);

      frontEndModel.modelType = {
        mainType: model.modelType.type
      };

      if (model.modelType.type === 'node-split') {
        frontEndModel.nodeSplitComparison = {
          from: model.modelType.details.from,
          to: model.modelType.details.to
        };
        frontEndModel.modelType.subType = 'specific-node-split';
      }

      if (model.modelType.type === 'pairwise') {
        frontEndModel.pairwiseComparison = {
          from: model.modelType.details.from,
          to: model.modelType.details.to
        };
        frontEndModel.modelType.subType = 'specific-pairwise';
      }

      if (model.modelType.type === 'regression') {
        frontEndModel.comparisonOption = model.regressor.variable;
        frontEndModel.treatmentInteraction = model.regressor.coefficient;
        frontEndModel.metaRegressionControl = {
          id: parseInt(model.regressor.control)
        };
        frontEndModel.levels = model.regressor.levels;
        delete frontEndModel.regressor;
      }

      frontEndModel.likelihoodLink = {
        likelihood: model.likelihood,
        link: model.link
      };
      delete frontEndModel.likelihood;
      delete frontEndModel.link;

      if (model.outcomeScale) {
        frontEndModel.outcomeScale = {
          type: 'fixed',
          value: model.outcomeScale
        };
      } else {
        frontEndModel.outcomeScale = {
          type: 'heuristically'
        };
      }

      if (!model.heterogeneityPrior) {
        frontEndModel.heterogeneityPrior = {
          type: 'automatic'
        };
      }

      frontEndModel.leaveOneOut = {};
      if (model.sensitivity && model.sensitivity.omittedStudy) {
        frontEndModel.leaveOneOut.isSelected = true;
        frontEndModel.leaveOneOut.omittedStudy = model.sensitivity.omittedStudy;
        frontEndModel.leaveOneOut.subType = 'specific-leave-one-out';
      }

      return frontEndModel;
    }

    function createModelBatch(modelBase, comparisonOptions, nodeSplitOptions) {
      if (modelBase.modelType.mainType === 'pairwise') {
        return _.map(comparisonOptions, function(comparisonOption) {
          var newModel = _.cloneDeep(modelBase);
          newModel.title = modelBase.title + ' (' + comparisonOption.from.name + ' - ' + comparisonOption.to.name + ')';
          newModel.pairwiseComparison = comparisonOption;
          return newModel;
        });
      } else if (modelBase.modelType.mainType === 'node-split') {
        return _.map(nodeSplitOptions, function(nodeSplitOption) {
          var newModel = _.cloneDeep(modelBase);
          newModel.title = modelBase.title + ' (' + nodeSplitOption.from.name + ' - ' + nodeSplitOption.to.name + ')';
          newModel.nodeSplitComparison = nodeSplitOption;
          return newModel;
        });
      }
    }

    function createLeaveOneOutBatch(modelBase, leaveOneOutOptions) {
      return _.map(leaveOneOutOptions, function(leaveOneOutOption) {
        var newModel = _.cloneDeep(modelBase);
        newModel.title = modelBase.title + ' (without ' + leaveOneOutOption + ')';
        newModel.leaveOneOut.omittedStudy = leaveOneOutOption;
        return newModel;
      });
    }

    function isVariableBinary(covariateName, problem) {
      return !_.find(problem.studyLevelCovariates, function(covariate) {
        return covariate[covariateName] !== 0.0 && covariate[covariateName] !== 1.0 &&
          covariate[covariateName] !== 0 && covariate[covariateName] !== 1;
      });
    }

    function getCovariateBounds(covariateName, problem) {
      return _.reduce(problem.studyLevelCovariates, function(accum, covariate) {
        var v = covariate[covariateName];
        if (v === undefined || v === null) {
          return accum;
        }

        // accum.min = _.min(accum.min, v);
        // accum.max = _.max(accum.max, v);
        if (accum.min === undefined) {
          accum.min = v;
        } else if (v < accum.min) {
          accum.min = covariate[covariateName];
        }

        if (accum.max === undefined) {
          accum.max = v;
        } else if (v > accum.max) {
          accum.max = covariate[covariateName];
        }

        return accum;
      }, {
        min: undefined,
        max: undefined
      });
    }

    function getBinaryCovariateNames(problem) {
      var studies = _.keys(problem.studyLevelCovariates);
      if (studies.length) {
        var covariateNames = _.keys(problem.studyLevelCovariates[studies[0]]);
        return _.filter(covariateNames, function(covariateName) {
          return isVariableBinary(covariateName, problem);
        });
      } else {
        return [];
      }
    }

    function isProblemWithCovariates(problem) {
      var studies = _.keys(problem.studyLevelCovariates);
      if (studies.length) {
        return Object.keys(problem.studyLevelCovariates[studies[0]]).length > 0;
      }
    }

    function findCentering(resultsWithLevels) {
      return _.find(resultsWithLevels, function(resultWithLevel) {
        return resultWithLevel.level === 'centering';
      });
    }

    function filterCentering(resultsWithLevels) {
      return _.filter(resultsWithLevels, function(resultWithLevel) {
        return resultWithLevel.level !== 'centering';
      });
    }


    function nameRankProbabilities(rankProbabilities, treatments) {
      var treatmentsById = _.keyBy(treatments, 'id');
      return _.chain(rankProbabilities)
        .toPairs()
        .map(function(pair) {
          var treatmentName = treatmentsById[pair[0]].name;
          return [treatmentName, pair[1]];
        })
        .fromPairs()
        .value();
    }

    function addLevelandProcessData(rankProbabilities, treatments, dataProcessingFunction) {
      return _.map(rankProbabilities, function(rankProbability, key) {
        return {
          level: key,
          data: dataProcessingFunction(rankProbability, treatments)
        };
      });
    }

    function selectLevel(regressor, problem, data, resultRegressor) {
      var result = {
        all: data
      };
      if (regressor && isVariableBinary(regressor.variable, problem)) {
        result.all = filterCentering(result.all);
        result.selected = result.all[0];
      } else {
        result.selected = findCentering(result.all);
        if (regressor) {
          result.selected.level = 'centering (' + resultRegressor.modelRegressor.center + ')';
        }
      }
      return result;
    }

    function buildScalesProblem(analysis, problem, baselineDistribution, result) {
      var criteria = {};
      criteria[analysis.outcome.name] = {
        scale: baselineDistribution.scale === 'mean' ? null : [0, 1],
        pvf: null,
        title: analysis.outcome.name,
        unitOfMeasurement: baselineDistribution.scale === 'mean' ? null : 'proportion'
      };
      var baselineId;
      var alternatives = _.fromPairs(_.map(problem.treatments, function(treatment) {
        if (baselineDistribution.name === treatment.name) {
          baselineId = treatment.id;
        }
        return [treatment.name, {
          alternative: treatment.id,
          title: treatment.name
        }];
      }));

      var performanceTable = _.map(criteria, function(criterion, criterionName) {
        var mu = _.fromPairs(_.map(problem.treatments, function(treatment) {
          var value;
          if (treatment.id === baselineId) {
            value = 0.0;
          } else {
            value = result.multivariateSummary[baselineId].mu['d.' + baselineId + '.' + treatment.id];
          }
          return [treatment.name, value];
        }));

        var treatmentsSorted = _.sortBy(problem.treatments, function(treatment) {
          return treatment.id === baselineId ? -1 : 1;
        });
        var names = _.map(treatmentsSorted, function(alternative) {
          return alternative.name;
        });
        var data = _.map(treatmentsSorted, function(treatmentX, idxX) {
          return _.map(treatmentsSorted, function(treatmentY, idxY) {
            if (idxX === 0 || idxY === 0) {
              return 0;
            }
            return result.multivariateSummary[baselineId].sigma['d.' + baselineId + '.' + treatmentY.id]['d.' + baselineId + '.' + treatmentX.id];
          });
        });

        var performanceType;
        if (result.link === 'identity') {
          performanceType = 'relative-normal';
        } else if (result.likelihood === 'poisson') {
          performanceType = 'relative-survival';
        } else {
          performanceType = 'relative-' + result.link + '-normal';
        }

        return {
          criterion: criterionName,
          performance: {
            type: performanceType,
            parameters: {
              baseline: baselineDistribution,
              relative: {
                type: 'dmnorm',
                mu: mu,
                cov: {
                  rownames: names,
                  colnames: names,
                  data: data
                }
              }
            }
          }
        };
      });

      return {
        method: 'scales',
        criteria: criteria,
        alternatives: alternatives,
        performanceTable: performanceTable
      };
    }

    function betaEntryBuilder(alternative, entry, idx) {
      return {
        idx: idx,
        studyName: entry.study,
        alternativeName: alternative.name,
        performance: entry.responders + '/' + entry.sampleSize,
        responders: entry.responders,
        sampleSize: entry.sampleSize
      };
    }

    function tEntryBuilder(alternative, entry, idx) {
      var stdErr = entry['std.err'] ? entry['std.err'] : entry['std.dev'] / Math.sqrt(entry.sampleSize);
      return {
        idx: idx,
        studyName: entry.study,
        alternativeName: alternative.name,
        performance: 'μ: ' + entry.mean + '; SE: ' + stdErr.toPrecision(3) + '; N=' + entry.sampleSize,
        mu: entry.mean,
        stdErr: stdErr,
        sampleSize: entry.sampleSize
      };
    }

    function survEntryBuilder(alternative, entry, idx) {
        var scaleStrings = {
          P1D: ' days',
          P1W: ' weeks',
          P1M: ' months',
          P1Y: ' years'
        };
      var performanceStr = entry.timeScale ? entry.responders + ' events over ' + entry.exposure + scaleStrings[entry.timeScale] :
        entry.responders + '/' + entry.exposure; // timescale not necessarily there in gemtc standalone
      return {
        idx: idx,
        studyName: entry.study,
        alternativeName: alternative.name,
        performance: performanceStr,
        responders: entry.responders,
        exposure: entry.exposure
      };
    }

    function buildBaselineSelectionEvidence(problem, alternatives, scale) {
      var entryBuilder;
      if (scale === 'log odds') {
        entryBuilder = betaEntryBuilder;
      } else if (scale === 'mean') {
        entryBuilder = tEntryBuilder;
      } else if (scale === 'log hazard') {
        entryBuilder = survEntryBuilder;
      }
      return _.reduce(alternatives, function(accum, alternative) {
        var filteredEntries = _.sortBy(_.filter(problem.entries, ['treatment', alternative.id]), 'study');
        var evidenceTable;

        evidenceTable = _.map(filteredEntries, _.partial(entryBuilder, alternative));
        accum[alternative.id] = evidenceTable;
        return accum;
      }, {});
    }

    function isInValidBaseline(baselineDistribution) {
      if (baselineDistribution.type === 'dbeta-logit') {
        return (baselineDistribution.alpha === undefined ||
          baselineDistribution.alpha === null ||
          baselineDistribution.alpha < 1 ||
          baselineDistribution.beta === undefined ||
          baselineDistribution.beta === null ||
          baselineDistribution.beta < 1);
      } else if (baselineDistribution.type === 'dnorm') {
        return (baselineDistribution.mu === undefined ||
          baselineDistribution.mu === null ||
          baselineDistribution.sigma === undefined ||
          baselineDistribution.sigma === null ||
          baselineDistribution.sigma < 0);
      } else if (baselineDistribution.type === 'dt') {
        return (baselineDistribution.mu === undefined ||
          baselineDistribution.mu === null ||
          baselineDistribution.stdErr === undefined ||
          baselineDistribution.stdErr === null ||
          baselineDistribution.stdErr < 0);
      } else if (baselineDistribution.type === 'dsurv') {
        return (baselineDistribution.alpha === undefined ||
          baselineDistribution.alpha === null ||
          baselineDistribution.alpha <= 0 ||
          baselineDistribution.beta === undefined ||
          baselineDistribution.beta === null ||
          baselineDistribution.beta <= 0 ||
          baselineDistribution.summaryMeasure === undefined ||
          (baselineDistribution.summaryMeasure === 'survivalAtTime' && baselineDistribution.time === undefined) ||
          (baselineDistribution.summaryMeasure === 'survivalAtTime' && baselineDistribution.time === null) ||
          (baselineDistribution.summaryMeasure === 'survivalAtTime' && baselineDistribution.time < 0));
      }
      return true; // unknown types are always invalid
    }
    return {
      cleanModel: cleanModel,
      toFrontEnd: toFrontEnd,
      getBinaryCovariateNames: getBinaryCovariateNames,
      isProblemWithCovariates: isProblemWithCovariates,
      getCovariateBounds: getCovariateBounds,
      createLeaveOneOutBatch: createLeaveOneOutBatch,
      findPrimaryModel: findPrimaryModel,
      createModelBatch: createModelBatch,
      isVariableBinary: isVariableBinary,
      findCentering: findCentering,
      filterCentering: filterCentering,
      addLevelandProcessData: addLevelandProcessData,
      nameRankProbabilities: nameRankProbabilities,
      selectLevel: selectLevel,
      buildScalesProblem: buildScalesProblem,
      buildBaselineSelectionEvidence: buildBaselineSelectionEvidence,
      isInValidBaseline: isInValidBaseline
    };
  };

  return dependencies.concat(ModelService);
});
