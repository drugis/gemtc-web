'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = ['$scope', '$q', '$stateParams', '$state', '$modal', 'gemtcRootPath', 'models', 'problem', 'AnalysisService', 'ModelResource', 'NodeSplitOverviewService'];
  var NodeSplitOverviewController = function($scope, $q, $stateParams, $state, $modal, gemtcRootPath, models, problem, AnalysisService, ModelResource, NodeSplitOverviewService) {

    $scope.goToModel = goToModel;
    $scope.openCreateNodeSplitDialog = openCreateNodeSplitDialog;
    $scope.networkModelResultsDefer = $q.defer();
    $scope.analysis.$promise.then(buildComparisons);

    $scope.model.$promise.then(function() {
      if ($scope.model.modelType.type === 'node-split') {
        var networkModel = findNetworkModelForModel($scope.model, models);
        if (networkModel) {
          var getParams = $stateParams;
          getParams.modelId = networkModel.id
          $scope.networkModel = ModelResource.get(getParams);
        }
      } else {
        $scope.networkModel = $scope.model;
      }

      if ($scope.networkModel) {
        $scope.networkModel.$promise.then(function(networkModel) {
          if (networkModel.taskId) {
            $scope.networkModel.result = getModelResult(networkModel.id);
            $scope.networkModel.result.$promise.then($scope.networkModelResultsDefer.resolve);
          }
        });
      }
    });

    function buildComparisons(analysis) {
      $scope.comparisons = _.map(AnalysisService.createNodeSplitOptions(analysis.problem), function(comparison) {
        var row = comparison;
        var model = findModelForComparison(comparison, models);

        if (model) {
          row = buildComparisonTableRow(comparison, model);
        }

        $scope.networkModelResultsDefer.promise.then(function(result) {
          fillConsistencyCell(row, result);
        });

        return row;
      });
    }

    function findNetworkModelForModel(nodeSplitModel, models) {
      return _.find(models, function(model) {
        return model.modelType.type === 'network' && isSameModelSettings(nodeSplitModel, model);
      })
    }

    function isSameModelSettings(model1, model2) {
      return (
        model1.likelihood === model2.likelihood &&
        model1.link === model2.link &&
        model1.linearModel === model2.linearModel &&
        ((model1.outcomeScale === undefined && model2.outcomeScale === undefined) ||
          (model1.outcomeScale.type === model2.outcomeScale.type &&
            model1.outcomeScale.value === model2.outcomeScale.value)
        )
      );
    }

    function buildComparisonTableRow(comparison, model) {
      var row = {
        label: comparison.label,
        from: comparison.from,
        to: comparison.to,
        modelTitle: model.title,
        modelId: model.id,
        hasModel: true
      };

      if (model.taskId) {
        row.result = getModelResult(model.id);
        row.result.$promise.then(function(result) {
          row.directEffectEstimate = NodeSplitOverviewService.buildDirectEffectEstimates(result);
          row.inDirectEffectEstimate = NodeSplitOverviewService.buildIndirectEffectEstimates(result);
        });
      }

      return row;
    }

    function fillConsistencyCell(row, result) {
      row.consistencyEstimate = NodeSplitOverviewService.buildConsistencyEstimates(result, row);
    }

    function getModelResult(modelId) {
      var getParams = $stateParams;
      getParams.modelId = modelId;
      return ModelResource.getResult(getParams);
    }

    function findModelForComparison(comparison, models) {
      return _.find(models, function(model) {
        // todo: model settings should be equal.
        return (
          model.modelType.type === 'node-split' &&
          model.modelType.details.from.id === comparison.from.id &&
          model.modelType.details.to.id === comparison.to.id
        );
      });
    }

    function goToModel(modelId) {
      var goToModelParams = angular.copy($stateParams);
      goToModelParams.modelId = modelId;
      $state.go('model', goToModelParams);
    }

    function openCreateNodeSplitDialog(comparison) {
      $modal.open({
        windowClass: 'small',
        templateUrl: gemtcRootPath + 'js/models/createNodeSplitModel.html',
        scope: $scope,
        controller: 'CreateNodeSplitModelController',
        resolve: {
          baseModel: function() {
            return angular.copy($scope.model);
          },
          problem: function() {
            return problem;
          },
          comparison: function() {
            return comparison;
          },
          successCallback: function() {
            return function() {
              // reload page, with empty params object
              $state.go($state.current, {}, {
                reload: true
              });
            }
          }
        }
      });
    };


  };

  return dependencies.concat(NodeSplitOverviewController);
});