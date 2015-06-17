'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', '$modal', 'ModelResource'];
  var ModelsController = function($scope, $stateParams, $modal, ModelResource) {
    $scope.modelsLoaded = false;
    $scope.analysisId = $stateParams.analysisId;

    $scope.loadModels = function() {
      $scope.models = ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
      });
    }
    $scope.loadModels();

    $scope.createModelDialog = function() {
      $modal.open({
        templateUrl: './js/models/addModel.html',
        scope: $scope,
        controller: 'AddModelController'
      });
    };

    $scope.isAddButtonDisabled = function(model) {
      return !model ||
        !model.title ||
        !!$scope.isAddingModel;
    }

  }
  return dependencies.concat(ModelsController);
});