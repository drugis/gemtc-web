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
      $scope.model.pairwiseComparison = $scope.comparisonOptions[0];
      $scope.nodeSplitOptions = AnalysisService.createNodeSplitOptions(problem);
      return problem;
    });

    $scope.model = {
      linearModel: 'random',
      modelType: {
        type: 'network'
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

    checkRunLength();
    $scope.$watch('model', function(newValue, oldValue) {
      checkRunLength();
    }, true); // true -> deep watch

    function checkRunLength() {
      problemDefer.$promise.then(function(problem) {
        if ($scope.model.modelType.type === 'all-pairwise') {
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
        !!$scope.isAddingModel;
    }

    function createModelBatch(modelBase) {
      return _.map($scope.comparisonOptions, function(comparisonOption) {
        var newModel = _.cloneDeep(modelBase);
        newModel.title = modelBase.title + ' (' + comparisonOption.from.name + ' - ' + comparisonOption.to.name + ')';
        newModel.modelType = {
          type: 'pairwise',
          details: {
            from: comparisonOption.from.name,
            to: comparisonOption.to.name
          }
        };
        newModel.pairwiseComparison = comparisonOption;
        return newModel;
      });
    }

    function createModel(model) {
      $scope.isAddingModel = true;
      if (model.modelType.type === 'all-pairwise') {
        var modelsToCreate = createModelBatch(model);
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
          })).replace();
        });
      }
    }

    function createAndPostModel(model, successFunction) {
      if (model.modelType.type === 'pairwise') {
        model.modelType.details = {
          from: model.pairwiseComparison.from.name,
          to: model.pairwiseComparison.to.name
        };
      } else {
        if (model.modelType === 'node-split') {
          model.modelType.details = {
            from: model.nodeSplitComparison.from.name,
            to: model.nodeSplitComparison.to.name
          };
        }
      }
      var pureModel = _.omit(model, 'pairwiseComparison', 'nodeSplitComparison');
      return ModelResource.save($stateParams, pureModel, successFunction).$promise;

    }
  };

  return dependencies.concat(CreateModelController);
});
