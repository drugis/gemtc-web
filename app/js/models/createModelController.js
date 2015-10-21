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
      }
    };
    $scope.isTaskTooLong = false;
    $scope.createModel = createModel;
    $scope.isAddButtonDisabled = isAddButtonDisabled;
    $scope.modelTypeChange = modelTypeChange;
    $scope.outcomeScaleTypeChange = outcomeScaleTypeChange;
    $scope.heterogeneityPriorTypechange = heterogeneityPriorTypechange;
    $scope.isNumber = isNumber;
    $scope.cleanModel = modelDefer;
    $scope.problem = ProblemResource.get($stateParams);

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
      return problem;
    });



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
    }

    function outcomeScaleTypeChange() {
      if( $scope.model.outcomeScale.type === 'heuristically') {
        $scope.model.outcomeScale.value = undefined;
      } else {
        $scope.model.outcomeScale.value = 5; // magic number: w to the power of 0 devided by 15
      }
    }

    function heterogeneityPriorTypechange() {
      $scope.model.heterogeneityPrior.values = undefined;
    }

    function isAddButtonDisabled(model) {
      return !model ||
        !model.title ||
        !!$scope.isAddingModel ||
        !model.likelihoodLink ||
        model.likelihoodLink.compatibility === 'incompatible'||
        $scope.model.outcomeScale.value <= 0||
        ($scope.model.outcomeScale.type === 'fixed' && !angular.isNumber($scope.model.outcomeScale.value));
    }

    function isNumber(value) {
      return angular.isNumber(value);
    }

    function createModel(model) {
      $scope.isAddingModel = true;
      if (model.modelType.subType === 'all-pairwise' || model.modelType.subType === 'all-node-split') {
        var modelsToCreate = ModelServiceBatch.createModelBatch(model, $scope.comparisonOptions, $scope.nodeSplitOptions);
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
