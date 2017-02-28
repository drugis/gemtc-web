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
          result.selected.level = 'centering (' + resultRegressor.modelRegressor.mu + ')';
        }
      }
      return result;
    }

    function buildScalesProblem(analysis, problem, baselineDistribution) {
      var criteria = {};
      criteria[analysis.outcome.name] = {
        scale: baselineDistribution.scale === 'mean' ? null : [0, 1],
        pvf: null,
        title: analysis.outcome.name,
        unitOfMeasurement: baselineDistribution.scale === 'mean' ? null : 'proportion'
      };

      var alternatives = _.fromPairs(_.map(problem.treatments, function(treatment) {
        return [treatment.name, {
          alternative: treatment.id,
          title: treatment.name
        }];
      }));

      var performanceTable = _.map(criteria, function(criterion, criterionName) {
        var result = {
          criterion: criterionName
        };



        return result;
      });

      return {
        criteria: criteria,
        alternatives: alternatives,
        performanceTable: performanceTable
      };

      //out
      // expectedResult = {
      //     "criteria": {
      //       "HAM-D Responders": {
      //         "criterionUri": "http://trials.drugis.org/concepts/hamd",
      //         "scale": [
      //           0,
      //           1
      //         ],
      //         "pvf": null,
      //         "title": "HAM-D Responders",
      //         "unitOfMeasurement": "proportion"
      //       }
      //     },
      //     "alternatives": {
      //       "Paroxetine": {
      //         "alternative": 260,
      //         "title": "Paroxetine"
      //       },
      //       "Fluoxetine": {
      //         "alternative": 259,
      //         "title": "Fluoxetine"
      //       },
      //       "Sertraline": {
      //         "alternative": 258,
      //         "title": "Sertraline"
      //       }
      //     },
      //     "performanceTable": [{
      //       "criterion": "HAM-D Responders",
      //       "performance": {
      //         "type": "relative-logit-normal",
      //         "parameters": {
      //           "baseline": {
      //             "scale": "log odds",
      //             "mu": 0.5,
      //             "sigma": 3,
      //             "name": "Fluoxetine",
      //             "type": "dnorm"
      //           },
      //           "relative": {
      //             "type": "dmnorm",
      //             "mu": {
      //               "Paroxetine": 0.20157,
      //               "Fluoxetine": 0,
      //               "Sertraline": 0.2784
      //             },
      //             "cov": {
      //               "rownames": [
      //                 "Fluoxetine",
      //                 "Paroxetine",
      //                 "Sertraline"
      //               ],
      //               "colnames": [
      //                 "Fluoxetine",
      //                 "Paroxetine",
      //                 "Sertraline"
      //               ],
      //               "data": [
      //                 [0, 0, 0],
      //                 [0, 0.031691, 0.0038127],
      //                 [0, 0.0038127, 0.031576]
      //               ]
      //             }
      //           }
      //         }
      //       }
      //     }]
      //   };
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
      buildScalesProblem: buildScalesProblem
    };
  };

  return dependencies.concat(ModelService);
});
