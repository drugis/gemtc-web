'use strict';
define(['lodash', 'moment'], function(_, moment) {
  var dependencies = ['$scope', '$q', '$stateParams', '$state',
    'ModelResource', 'AnalysisService', 'ProblemResource'
  ];
  var CreateModelController = function($scope, $q, $stateParams, $state,
    ModelResource, AnalysisService, ProblemResource) {

    var problemDefer = ProblemResource.get($stateParams);
    problemDefer.$promise.then(function(problem) {
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
      return problem;
    });

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
      thinningFactor: 10
    };
    $scope.isTaskTooLong = false;
    $scope.createModel = createModel;
    $scope.isAddButtonDisabled = isAddButtonDisabled;
    $scope.isRunlengthDivisibleByThinningFactor = isRunlengthDivisibleByThinningFactor;
    $scope.checkRunLength = checkRunLength;
    $scope.modelTypeChange = modelTypeChange;
    $scope.outcomeScaleTypeChange = outcomeScaleTypeChange;
    $scope.isNumber = isNumber;

    checkRunLength();
    $scope.$watch('model', function(newValue, oldValue) {
      checkRunLength();
    }, true); // true -> deep watch

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

    function checkRunLength() {
      problemDefer.$promise.then(function(problem) {
        if (($scope.model.modelType.mainType === 'pairwise' && $scope.model.modelType.subType === 'all-pairwise') ||
          ($scope.model.modelType.mainType === 'node-split' && $scope.model.modelType.subType === 'all-node-split')
        ) {
          var modelBatch = createModelBatch($scope.model);
          $scope.estimatedRunLength = _.max(_.map(modelBatch, function(model) {
            return AnalysisService.estimateRunLength(problem, model);
          }));
        } else {
          $scope.estimatedRunLength = AnalysisService.estimateRunLength(problem, $scope.model);
        }
        $scope.estimatedRunLengthHumanized = moment.duration($scope.estimatedRunLength, 'seconds').humanize();
      });
    }

    function isRunlengthDivisibleByThinningFactor() {
      return $scope.model.burnInIterations % $scope.model.thinningFactor === 0 &&
        $scope.model.inferenceIterations % $scope.model.thinningFactor === 0;
    }

    function isAddButtonDisabled(model) {
      return !model ||
        !model.title ||
        !model.burnInIterations ||
        !model.inferenceIterations ||
        !model.thinningFactor ||
        !isRunlengthDivisibleByThinningFactor() ||
        $scope.estimatedRunLength > 300 ||
        !!$scope.isAddingModel ||
        !model.likelihoodLink ||
        model.likelihoodLink.compatibility === 'incompatible'||
        $scope.model.outcomeScale.value <= 0||
        ($scope.model.outcomeScale.type === 'fixed' && !angular.isNumber($scope.model.outcomeScale.value));
    }

    function isNumber(value) {
      return angular.isNumber(value);
    }

    function createModelBatch(modelBase) {
      if (modelBase.modelType.mainType == 'pairwise') {
        return _.map($scope.comparisonOptions, function(comparisonOption) {
          var newModel = _.cloneDeep(modelBase);
          newModel.title = modelBase.title + ' (' + comparisonOption.from.name + ' - ' + comparisonOption.to.name + ')';
          newModel.pairwiseComparison = comparisonOption;
          return newModel;
        });
      } else if (modelBase.modelType.mainType == 'node-split') {
        return _.map($scope.nodeSplitOptions, function(nodeSplitOption) {
          var newModel = _.cloneDeep(modelBase);
          newModel.title = modelBase.title + ' (' + nodeSplitOption.from.name + ' - ' + nodeSplitOption.to.name + ')';
          newModel.nodeSplitComparison = nodeSplitOption;
          return newModel;
        });
      }
    }

    function createModel(model) {
      $scope.isAddingModel = true;
      if (model.modelType.subType === 'all-pairwise' || model.modelType.subType === 'all-node-split') {
        var modelsToCreate = createModelBatch(model);
        var cleanModels = _.map(modelsToCreate, cleanModel);
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

    function cleanModel(frondEndModel) {
      var model = _.cloneDeep(frondEndModel);
      if (frondEndModel.modelType.mainType === 'node-split')
        model.modelType.details = {
          from: _.omit(frondEndModel.nodeSplitComparison.from, 'sampleSize'),
          to: _.omit(frondEndModel.nodeSplitComparison.to, 'sampleSize')
        };
      if (frondEndModel.modelType.mainType === 'pairwise') {
        model.modelType.details = {
          from: _.omit(frondEndModel.pairwiseComparison.from, 'sampleSize'),
          to: _.omit(frondEndModel.pairwiseComparison.to, 'sampleSize')
        };
      }
      model.modelType = _.omit(model.modelType, 'mainType', 'subType');
      model.modelType.type = frondEndModel.modelType.mainType;
      model.likelihood = frondEndModel.likelihoodLink.likelihood;
      model.link = frondEndModel.likelihoodLink.link;
      if(frondEndModel.outcomeScale.type === 'heuristically') {
        delete model.outcomeScale;
      } else {
        model.outcomeScale = frondEndModel.outcomeScale.value;
      }
      model = _.omit(model, 'pairwiseComparison', 'nodeSplitComparison', 'likelihoodLink');
      return model;
    }

    function createAndPostModel(frondEndModel, successFunction) {
      var model = cleanModel(frondEndModel);
      return ModelResource.save($stateParams, model, successFunction).$promise;

    }
  };

  return dependencies.concat(CreateModelController);
});
