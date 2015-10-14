'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = ['$scope', '$q', '$stateParams', '$state', 'models', 'problem', 'AnalysisService', 'ModelResource'];
  var NodeSplitOverviewController = function($scope, $q, $stateParams, $state, models, problem, AnalysisService, ModelResource) {

    $scope.models = models;
    $scope.goToModel = goToModel;
    $scope.comparisons = _.map(AnalysisService.createNodeSplitOptions(problem), buildComparison);

    function buildComparison(comparison) {
      var model = findModelForComparison(comparison, $scope.models);
      var modelResult;
      if (model && model.taskId) {
        modelResult = ModelResource.getResult({
          analysisId: $stateParams.analysisId,
          modelId: model.id
        });
      }

      return model ? {
        modelTitle: model.title,
        label: comparison.label,
        result: modelResult
      } : comparison;
    }

    function findModelForComparison(comparison, models) {
      return _.find(models, function(model) {
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
