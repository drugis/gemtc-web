'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', '$location', 'AnalysisResource', 'ModelResource'];
  var CreateModelController = function($scope, $stateParams, $location, AnalysisResource, ModelResource) {

    $scope.analysis = AnalysisResource.get($stateParams);

    $scope.isAddButtonDisabled = function(model) {
      return !model ||
        !model.title ||
        !!$scope.isAddingModel;
    }

    $scope.createModel = function(model) {
      $scope.isAddingModel = true;
      ModelResource.save($stateParams, model, function(result, headers) {
        $scope.isAddingAnalysis = false;
        // Call to replace is needed to have backbutton skip the createModel view when going back from the model View
        $location.url(headers().location).replace();
      });
    };

  }
  return dependencies.concat(CreateModelController);
});