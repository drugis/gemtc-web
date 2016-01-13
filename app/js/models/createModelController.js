'use strict';
define(['lodash', 'moment'], function(_, moment) {
  var dependencies = ['$scope', '$q', '$stateParams', '$state',
    'ModelResource', 'ModelService', 'AnalysisService', 'ProblemResource'
  ];
  var CreateModelController = function($scope, $q, $stateParams, $state,
    ModelResource, ModelService, AnalysisService, ProblemResource) {

    var modelDefer = $q.defer();
    modelDefer.$promise = modelDefer.promise;

    $scope.model = {
      linearModel: 'random',
      modelType: {
        mainType: 'network'
      },
      outcomeScale: {
        type: 'heuristically'
      },
      burnInIterations: 5000,
      inferenceIterations: 20000,
      thinningFactor: 10,
      heterogeneityPrior: {
        type: 'automatic'
      },
      treatmentInteraction: 'shared'
    };
    $scope.isTaskTooLong = false;
    $scope.isValidHeterogeneityPrior = true;
    $scope.createModel = createModel;
    $scope.isAddButtonDisabled = isAddButtonDisabled;
    $scope.effectsTypeChange = effectsTypeChange;
    $scope.modelTypeChange = modelTypeChange;
    $scope.outcomeScaleTypeChange = outcomeScaleTypeChange;
    $scope.heterogeneityPriorTypechange = heterogeneityPriorTypechange;
    $scope.heterogeneityParamsChange = heterogeneityParamsChange;
    $scope.covariateChange = covariateChange;
    $scope.addLevel = addLevel;
    $scope.addLevelOnEnter = addLevelOnEnter;
    $scope.levelAlreadyPresent = levelAlreadyPresent;
    $scope.isNumber = isNumber;
    $scope.cleanModel = modelDefer;
    $scope.problem = ProblemResource.get($stateParams);
    $scope.selectedCovariateValueHasNullValues = false;

    $scope.problem.$promise.then(function(problem) {
      $scope.comparisonOptions = AnalysisService.createPairwiseOptions(problem);
      if ($scope.comparisonOptions.length > 0) {
        $scope.model.pairwiseComparison = $scope.comparisonOptions[0];
      }
      $scope.nodeSplitOptions = AnalysisService.createNodeSplitOptions(problem);
      if ($scope.nodeSplitOptions.length > 0) {
        $scope.model.nodeSplitComparison = $scope.nodeSplitOptions[0];
      }

      $scope.likelihoodLinkOptions = AnalysisService.createLikelihoodLinkOptions(problem);
      var compatible = $scope.likelihoodLinkOptions.filter(function(option) {
        return option.compatibility === "compatible"
      });
      var incompatible = $scope.likelihoodLinkOptions.filter(function(option) {
        return option.compatibility === "incompatible"
      });
      $scope.likelihoodLinkOptions = compatible.concat(incompatible);
      $scope.model.likelihoodLink = compatible[0];
      modelDefer.resolve(ModelService.cleanModel($scope.model));
      if (problem.studyLevelCovariates) {
        $scope.covariateOptions = buildCovariateOptions(problem);
        $scope.model.covariateOption = $scope.covariateOptions[0];
        $scope.model.metaRegressionControl = problem.treatments[0];
        covariateChange();
      }
      return problem;
    });

    function effectsTypeChange() {
      if ($scope.model.linearModel === 'fixed') {
        delete $scope.model.heterogeneityPrior;
      } else {
        $scope.model.heterogeneityPrior = {
          type: 'automatic'
        }
      }
    }

    function covariateChange() {
      $scope.variableIsBinary = $scope.model.modelType.mainType === 'regression'
        && ModelService.isVariableBinary($scope.model.covariateOption, $scope.problem);
      if($scope.variableIsBinary) {
        $scope.model.levels = [0, 1];
      } else {
        $scope.model.levels = [];
      }
    }

    function buildCovariateOptions(problem) {
      return _.keys(problem.studyLevelCovariates[problem.entries[0].study]);
    }

    function modelTypeChange() {
      var mainType = $scope.model.modelType.mainType,
        subType = $scope.model.modelType.subType;

      if (mainType === 'network') {
        $scope.model.modelType.subType = '';
      }
      if (mainType === 'pairwise') {
        $scope.model.modelType.subType = 'all-pairwise';
      }
      if (mainType === 'node-split') {
        $scope.model.modelType.subType = 'all-node-split';
      }
      if (mainType === 'regression') {
        $scope.model.modelType.subType = '';
        covariateChange();
      }
    }

    function outcomeScaleTypeChange() {
      if ($scope.model.outcomeScale.type === 'heuristically') {
        $scope.model.outcomeScale.value = undefined;
      } else {
        $scope.model.outcomeScale.value = 5; // magic number: w to the power of 0 devided by 15
      }
    }

    function heterogeneityPriorTypechange() {
      $scope.model.heterogeneityPrior.values = undefined;
      heterogeneityParamsChange();
    }

    function heterogeneityParamsChange() {
      var values = $scope.model.heterogeneityPrior.values;
      if ($scope.model.heterogeneityPrior.type === 'automatic') {
        $scope.isValidHeterogeneityPrior = true;
      } else if (values === undefined) {
        $scope.isValidHeterogeneityPrior = false;
      } else if ($scope.model.heterogeneityPrior.type === 'standard-deviation') {
        $scope.isValidHeterogeneityPrior = (values.lower >= 0 && values.upper >= 0);
      } else if ($scope.model.heterogeneityPrior.type === 'variance') {
        $scope.isValidHeterogeneityPrior = (values.stdDev >= 0)
      } else if ($scope.model.heterogeneityPrior.type === 'precision') {
        $scope.isValidHeterogeneityPrior = (values.rate >= 0 && values.shape >= 0)
      }
    }

    function variableHasNAValues(covariateName, problem) {
      return _.find(problem.studyLevelCovariates, function(covariate) {
        return covariate[covariateName] === null;
      });
    }



    function addLevel(newLevel) {
      $scope.model.levels.push(newLevel);
      $scope.model.levels.sort(function(a, b) { return a - b; });
      $scope.newLevel = undefined;
    }

    function addLevelOnEnter($event, newLevel) {
      if ($event.which === 13 && !levelAlreadyPresent(newLevel)) { // 13 == enter key
        addLevel(newLevel);
        $event.stopPropagation();
        $event.preventDefault();
      }
    }

    function levelAlreadyPresent(newLevel) {
      return _.includes($scope.model.levels, newLevel);
    }

    function isAddButtonDisabled(model, problem) {

      $scope.selectedCovariateValueHasNullValues = model.modelType.mainType === 'regression' && variableHasNAValues(model.covariateOption, problem);

      return !model ||
        !model.title ||
        !!$scope.isAddingModel ||
        !model.likelihoodLink ||
        model.likelihoodLink.compatibility === 'incompatible' ||
        model.outcomeScale.value <= 0 ||
        (model.outcomeScale.type === 'fixed' && !angular.isNumber(model.outcomeScale.value)) || $scope.selectedCovariateValueHasNullValues;
    }

    function isNumber(value) {
      return angular.isNumber(value);
    }

    function createModel(model) {
      $scope.isAddingModel = true;
      if (model.modelType.subType === 'all-pairwise' || model.modelType.subType === 'all-node-split') {
        var modelsToCreate = ModelService.createModelBatch(model, $scope.comparisonOptions, $scope.nodeSplitOptions);
        var cleanModels = _.map(modelsToCreate, ModelService.cleanModel);
        var creationPromises = _.map(modelsToCreate, function(modelToCreate) {
          return createAndPostModel(modelToCreate, function() {});
        });
        $q.all(creationPromises).then(function() {
          $scope.isAddingModel = false;
          $state.go('networkMetaAnalysis', $stateParams);
        });
      } else {
        createAndPostModel(model, function(result, headers) {
          $scope.isAddingModel = false;
          $state.go('model', _.extend($stateParams, {
            modelId: result.id
          }));
        });
      }
    }

    function createAndPostModel(frontEndModel, successFunction) {
      var model = ModelService.cleanModel(frontEndModel);
      return ModelResource.save($stateParams, model, successFunction).$promise;
    }
  };

  return dependencies.concat(CreateModelController);
});
