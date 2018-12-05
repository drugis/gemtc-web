'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var CreateModelService = function() {

    function createNodeSplitComparison(nodeSplitComparison, options) {
      if (!nodeSplitComparison && options.length > 0) {
        return options[0];
      } else {
        return findMatchingNodeSplitOptions(nodeSplitComparison, options);
      }
    }

    function findMatchingNodeSplitOptions(nodeSplitComparison, options) {
      return _.find(options, function(option) {
        return option.from.id === nodeSplitComparison.from.id &&
          option.to.id === nodeSplitComparison.to.id;
      });
    }

    function createPairWiseComparison(pairwiseComparison, options) {
      if (!pairwiseComparison && options.length > 0) {
        return options[0];
      } else {
        return findMatchingComparisonOptions(pairwiseComparison, options);
      }
    }

    function findMatchingComparisonOptions(pairwiseComparison, options) {
      return _.find(options, function(option) {
        return option.from.id === pairwiseComparison.from.id &&
          option.to.id === pairwiseComparison.to.id;
      });
    }

    function heterogeneityParamsChange(prior) {
      var values = prior.values;
      if (prior.type === 'automatic') {
        return true;
      } else if (values === undefined) {
        return false;
      } else if (prior.type === 'standard-deviation') {
        return values.lower >= 0 && values.upper >= 0;
      } else if (prior.type === 'variance') {
        return values.stdDev >= 0;
      } else if (prior.type === 'precision') {
        return values.rate >= 0 && values.shape >= 0;
      }
    }

    function createLikelihoodLink(likelihoodLink, options) {
      if (!likelihoodLink) {
        return options[0].compatibility === 'compatible' ? options[0] : undefined;
      } else {
        return _.find(options, function(option) {
          return option.link === likelihoodLink.link &&
            option.likelihood === likelihoodLink.likelihood;
        });
      }
    }

    function buildCovariateOptions(problem) {
      var firstStudy = getFirstStudy(problem);
      return _.keys(problem.studyLevelCovariates[firstStudy]);
    }

    function getFirstStudy(problem) {
      if (problem.entries && problem.entries.length) {
        return problem.entries[0].study;
      } else {
        return _.keys(problem.relativeEffectData.data)[0];
      }
    }
    
    function getModelWithCovariates(model, problem, covariateOptions) {
      var newModel = angular.copy(model);
      if (!model.covariateOption) {
        newModel.covariateOption = covariateOptions[0];
      }
      if (!model.metaRegressionControl) {
        newModel.metaRegressionControl = problem.treatments[0];
      } else {
        newModel.metaRegressionControl = _.find(problem.treatments, function(treatment) {
          return treatment.id === model.metaRegressionControl.id;
        });
      }
      return newModel;
    }

    return {
      createNodeSplitComparison: createNodeSplitComparison,
      createPairWiseComparison: createPairWiseComparison,
      heterogeneityParamsChange: heterogeneityParamsChange,
      createLikelihoodLink: createLikelihoodLink,
      buildCovariateOptions: buildCovariateOptions,
      getModelWithCovariates: getModelWithCovariates
    };

  };

  return dependencies.concat(CreateModelService);
});
