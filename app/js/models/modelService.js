'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var ModelService = function() {

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
      model.likelihood = frontEndModel.likelihoodLink.likelihood;
      model.link = frontEndModel.likelihoodLink.link;
      if (frontEndModel.outcomeScale.type === 'heuristically') {
        delete model.outcomeScale;
      } else {
        model.outcomeScale = frontEndModel.outcomeScale.value;
      }
      if (model.heterogeneityPrior && model.heterogeneityPrior.type === 'automatic') {
        delete model.heterogeneityPrior;
      }
      model = _.omit(model, 'pairwiseComparison', 'nodeSplitComparison', 'likelihoodLink');
      return model;
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

    function isVariableBinary(covariateName, problem) {
      return !_.find(problem.studyLevelCovariates, function(covariate) {
        return covariate[covariateName] !== 0.0 && covariate[covariateName] !== 1.0 &&
          covariate[covariateName] !== 0 && covariate[covariateName] !== 1;
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

    function isProblemWithCovariates(problem){
      var studies = _.keys(problem.studyLevelCovariates);
      if (studies.length) {
        return Object.keys(problem.studyLevelCovariates[studies[0]]).length > 0;
      }
    }

    return {
      cleanModel: cleanModel,
      createModelBatch: createModelBatch,
      isVariableBinary: isVariableBinary,
      getBinaryCovariateNames: getBinaryCovariateNames,
      isProblemWithCovariates: isProblemWithCovariates
    };
  };

  return dependencies.concat(ModelService);
});
