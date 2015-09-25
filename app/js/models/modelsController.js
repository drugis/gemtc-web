'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$state', '$stateParams', 'ModelResource'];
  var ModelsController = function($scope, $state, $stateParams, ModelResource) {
    $scope.modelsLoaded = false;
    $scope.analysisId = $stateParams.analysisId;
    $scope.modelParams = function(model) {
      return _.extend($stateParams, {modelId: model.id});
    }
    $scope.loadModels = function() {
      $scope.models = ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
      });
    }
    $scope.loadModels();

    $scope.gotoCreateModel = function() {
      $state.go('createModel', $stateParams);
    }

    $scope.gotoModel = function(model) {
      $state.go('model', $scope.modelParams(model));
    }

  }
  return dependencies.concat(ModelsController);
});
