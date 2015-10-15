'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = ['$scope', '$stateParams', '$state', '$modal', 'models', 'problem', 'AnalysisService', 'ModelResource'];
  var NodeSplitOverviewController = function($scope, $stateParams, $state, $modal, models, problem, AnalysisService, ModelResource) {

    $scope.goToModel = goToModel;
    $scope.analysis.$promise.then(buildComparisons);
    $scope.openCreateNodeSplitDialog = openCreateNodeSplitDialog;

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
      $scope.networkModel.$promise.then(function(networkModel) {
        if (networkModel.taskId) {
          $scope.networkModel.result = getModelResult(networkModel.id);
        }
      });
    });

    function openCreateNodeSplitDialog(comparison) {
      $modal.open({
        templateUrl: './js/models/createNodes.html',
        scope: $scope,
        controller: 'AddAnalysisController'
      });
    };


    function buildComparisons(analysis) {
      $scope.comparisons = _.map(AnalysisService.createNodeSplitOptions(analysis.problem), function(comparison) {
        var model = findModelForComparison(comparison, models);
        if (model) {
          return buildComparisonTableRow(comparison, model);
        } else {
          return comparison;
        }
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
        model1.outcomeScale.type === model2.outcomeScale.type &&
        model1.outcomeScale.value === model2.outcomeScale.value
      );
    }

    function buildComparisonTableRow(comparison, model) {

      var modelResult;

      if (model && model.taskId) {
        modelResult = getModelResult(model.id);
      }

      return {
        modelTitle: model.title,
        hasModel: true,
        label: comparison.label,
        result: modelResult
      }
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


  };

  return dependencies.concat(NodeSplitOverviewController);
});