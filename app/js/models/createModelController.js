'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [
    '$scope',
    '$q',
    '$stateParams',
    '$state',
    'AnalysisService',
    'ModelResource',
    'ModelService',
    'PageTitleService',
    'ProblemResource',
    'CreateModelService'
  ];
  var CreateModelController = function(
    $scope,
    $q,
    $stateParams,
    $state,
    AnalysisService,
    ModelResource,
    ModelService,
    PageTitleService,
    ProblemResource,
    CreateModelService
  ) {
    // functions
    $scope.createModel = createModel;
    $scope.isAddButtonDisabled = isAddButtonDisabled;
    $scope.effectsTypeChange = effectsTypeChange;
    $scope.modelTypeChange = modelTypeChange;
    $scope.outcomeScaleTypeChange = outcomeScaleTypeChange;
    $scope.heterogeneityPriorTypechange = heterogeneityPriorTypechange;
    $scope.heterogeneityParamsChange = heterogeneityParamsChange;
    $scope.covariateChange = covariateChange;
    $scope.changeIsWeighted = changeIsWeighted;
    $scope.changeIsLeaveOneOut = changeIsLeaveOneOut;
    $scope.addLevel = addLevel;
    $scope.addLevelOnEnter = addLevelOnEnter;
    $scope.levelAlreadyPresent = levelAlreadyPresent;
    $scope.isCovariateLevelOutOfBounds = isCovariateLevelOutOfBounds;
    $scope.isAllowedLeaveOneOut = isAllowedLeaveOneOut;
    $scope.isNumber = isNumber;
    $scope.pairwiseSubTypeChange = pairwiseSubTypeChange;
    $scope.resetLeaveOneOut = resetLeaveOneOut;

    // init
    var pageTitle = $state.current.name === 'createModel' ? 'Create model' : 'Refine model';
    PageTitleService.setPageTitle('CreateModelController', pageTitle);

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
      treatmentInteraction: 'shared',
      leaveOneOut: {}
    };

    $scope.isTaskTooLong = false;
    $scope.isValidHeterogeneityPrior = true;
    $scope.selectedCovariateValueHasNullValues = false;
    $scope.covariateBounds = {
      min: undefined,
      max: undefined
    };

    $scope.problem = ProblemResource.get($stateParams);
    $scope.problem.$promise.then(function(problem) {
      $scope.comparisonOptions = AnalysisService.createPairwiseOptions(problem);
      $scope.nodeSplitOptions = AnalysisService.createNodeSplitOptions(problem);
      $scope.binaryCovariateNames = ModelService.getBinaryCovariateNames(problem);
      $scope.isProblemWithCovariates = ModelService.isProblemWithCovariates(problem);
      $scope.likelihoodLinkOptions = AnalysisService.createLikelihoodLinkOptions(problem);
      $scope.leaveOneOutOptions = AnalysisService.createLeaveOneOutOptions(problem, $scope.model.modelType.mainType);

      $scope.model.pairwiseComparison = CreateModelService.createPairWiseComparison(
        $scope.model.pairwiseComparison, $scope.nodeSplitOptions);
      $scope.model.nodeSplitComparison = CreateModelService.createNodeSplitComparison(
        $scope.model.nodeSplitComparison, $scope.nodeSplitOptions);
      $scope.model.likelihoodLink = CreateModelService.createLikelihoodLink(
        $scope.model.likelihoodLink, $scope.likelihoodLinkOptions);

      setCovariateOptions(problem);

      return problem;
    });

    function setCovariateOptions(problem) {
      if (problem.studyLevelCovariates) {
        $scope.covariateOptions = CreateModelService.buildCovariateOptions(problem);
        $scope.model = CreateModelService.getModelWithCovariates($scope.model, problem, $scope.covariateOptions);
      }
    }

    function effectsTypeChange() {
      if ($scope.model.linearModel === 'fixed') {
        delete $scope.model.heterogeneityPrior;
      } else {
        $scope.model.heterogeneityPrior = {
          type: 'automatic'
        };
      }
    }

    function covariateChange() {
      $scope.variableIsBinary = ModelService.isVariableBinary($scope.model.covariateOption, $scope.problem);
      if ($scope.variableIsBinary && $scope.model.modelType.mainType === 'regression') {
        $scope.model.levels = [0, 1];
      } else {
        $scope.model.levels = [];
      }

      $scope.covariateBounds = ModelService.getCovariateBounds($scope.model.covariateOption, $scope.problem);
    }

    function modelTypeChange() {
      var mainType = $scope.model.modelType.mainType;

      if (mainType === 'network') {
        $scope.model.modelType.subType = '';
        $scope.leaveOneOutOptions = AnalysisService.createLeaveOneOutOptions($scope.problem);
        $scope.model.leaveOneOut.omittedStudy = $scope.leaveOneOutOptions[0];
      }
      if (mainType === 'pairwise') {
        $scope.model.modelType.subType = 'all-pairwise';
      }
      if (mainType === 'node-split') {
        $scope.model.modelType.subType = 'all-node-split';
      }
      if (mainType === 'regression') {
        $scope.leaveOneOutOptions = AnalysisService.createLeaveOneOutOptions($scope.problem);
        $scope.model.leaveOneOut.omittedStudy = $scope.leaveOneOutOptions[0];
        $scope.model.modelType.subType = '';
        covariateChange();
      }

      resetLeaveOneOut();
    }

    function pairwiseSubTypeChange() {
      resetLeaveOneOut();
    }

    function resetLeaveOneOut() {
      $scope.model.leaveOneOut = {};

      if (isValidModelTypeForLeaveOneOut()) {
        $scope.leaveOneOutOptions = AnalysisService.createLeaveOneOutOptions($scope.problem);

        if ($scope.model.modelType.mainType === 'pairwise' && $scope.model.modelType.subType === 'specific-pairwise') {
          $scope.leaveOneOutOptions = _.filter($scope.leaveOneOutOptions, function(option) {
            return _.find($scope.model.pairwiseComparison.studies, function(study) {
              return study.title === option;
            });
          });
        }
        if ($scope.leaveOneOutOptions.length > 0) {
          $scope.model.leaveOneOut.omittedStudy = $scope.leaveOneOutOptions[0];
        }
      }
    }

    function outcomeScaleTypeChange() {
      if ($scope.model.outcomeScale.type === 'heuristically') {
        $scope.model.outcomeScale.value = undefined;
      } else {
        $scope.model.outcomeScale.value = 5; // magic number: w to the power of 0 divided by 15
      }
    }

    function heterogeneityPriorTypechange() {
      $scope.model.heterogeneityPrior.values = undefined;
      heterogeneityParamsChange();
    }

    function heterogeneityParamsChange() {
      $scope.isValidHeterogeneityPrior = CreateModelService.heterogeneityParamsChange($scope.model.heterogeneityPrior);
    }

    function changeIsWeighted() {
      if (!$scope.isWeighted) {
        delete $scope.model.sensitivity;
      } else {
        $scope.model.sensitivity = {
          inflationValue: 0,
          weightingFactor: 0.5,
          adjustmentFactor: $scope.binaryCovariateNames[0]
        };
      }
    }

    function isValidModelTypeForLeaveOneOut() {
      var mainType = $scope.model.modelType.mainType;
      return mainType === 'network' ||
        (mainType === 'pairwise' && $scope.model.modelType.subType === 'specific-pairwise') ||
        mainType === 'regression';
    }

    function isAllowedLeaveOneOut() {
      return isValidModelTypeForLeaveOneOut() && $scope.leaveOneOutOptions && $scope.leaveOneOutOptions.length > 0;
    }

    function changeIsLeaveOneOut(newValue) {
      if (!newValue) {
        resetLeaveOneOut();
      } else {
        $scope.model.leaveOneOut.subType = 'all-leave-one-out';
        if ($scope.leaveOneOutOptions.length > 0) {
          $scope.model.leaveOneOut.omittedStudy = $scope.leaveOneOutOptions[0];
        }
      }
    }

    function variableHasNAValues(covariateName, problem) {
      var entryMap = _.keyBy(problem.entries, 'study');
      return _.find(entryMap, function(entry) {
        return problem.studyLevelCovariates[entry.study][covariateName] === null;
      });
    }

    function addLevel(newLevel) {
      $scope.model.levels.push(newLevel);
      $scope.model.levels.sort(function(a, b) {
        return a - b;
      });
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

    function isCovariateLevelOutOfBounds(level) {
      return level < $scope.covariateBounds.min || level > $scope.covariateBounds.max;
    }

    function isAddButtonDisabled(model, problem) {
      $scope.selectedCovariateValueHasNullValues = model.modelType.mainType === 'regression' && variableHasNAValues(model.covariateOption, problem);

      return !model ||
        !model.title ||
        !!$scope.isAddingModel ||
        !model.likelihoodLink ||
        model.likelihoodLink.compatibility === 'incompatible' ||
        model.outcomeScale.value <= 0 ||
        (model.outcomeScale.type === 'fixed' &&
          !angular.isNumber(model.outcomeScale.value)) ||
        $scope.selectedCovariateValueHasNullValues ||
        !!($scope.isWeighted && model.sensitivity.weightingFactor === undefined);
    }

    function isNumber(value) {
      return angular.isNumber(value);
    }

    function createModel(model) {
      $scope.isAddingModel = true;
      if (model.modelType.subType === 'all-pairwise' || model.modelType.subType === 'all-node-split') {
        var modelsToCreate = ModelService.createModelBatch(model, $scope.comparisonOptions, $scope.nodeSplitOptions);
        var creationPromises = _.map(modelsToCreate, function(modelToCreate) {
          return createAndPostModel(modelToCreate, function() { });
        });
        $q.all(creationPromises).then(function() {
          $state.go('networkMetaAnalysis', $stateParams);
        });
      } else if (model.leaveOneOut.subType === 'all-leave-one-out') {
        var leaveOneOutModels = ModelService.createLeaveOneOutBatch(model, $scope.leaveOneOutOptions);
        var leaveOneOutPromises = _.map(leaveOneOutModels, function(modelToCreate) {
          return createAndPostModel(modelToCreate, function() { });
        });
        $q.all(leaveOneOutPromises).then(function() {
          $state.go('networkMetaAnalysis', $stateParams);
        });
      } else {
        createAndPostModel(model, function(result) {
          $state.go('model', _.extend({}, $stateParams, {
            modelId: result.id
          }));
        });
      }
    }

    function createAndPostModel(frontEndModel, successFunction) {
      var model = ModelService.cleanModel(frontEndModel);
      return ModelResource.save(_.omit($stateParams, 'modelId'), model, successFunction).$promise;
    }
  };

  return dependencies.concat(CreateModelController);
});
