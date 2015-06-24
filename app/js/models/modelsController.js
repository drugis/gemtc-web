'use strict';
define([], function() {
  var dependencies = ['$scope', '$state', '$stateParams', 'ModelResource'];
  var ModelsController = function($scope, $state, $stateParams, ModelResource) {
    $scope.modelsLoaded = false;
    $scope.analysisId = $stateParams.analysisId;

    $scope.loadModels = function() {
      $scope.models = ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
      });
    }
    $scope.loadModels();

    $scope.gotoCreateModel = function() {
      $state.go('createModel', $stateParams);
    }

  }
  return dependencies.concat(ModelsController);
});