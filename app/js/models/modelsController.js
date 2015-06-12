'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', '$modal', 'ModelResource'];
  var ModelsController = function($scope, $stateParams, $modal, ModelResource) {
    $scope.modelsLoaded = false;

    function loadModels() {
      $scope.models = ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
      });
    }
    loadModels();

  }
  return dependencies.concat(ModelsController);
});