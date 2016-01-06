'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$state', '$stateParams', 'AnalysisResource', 'ModelResource'];
  var ModelsController = function($scope, $state, $stateParams, AnalysisResource, ModelResource) {
    $scope.modelsLoaded = false;
    $scope.analysisId = $stateParams.analysisId;
    $scope.setAsPrimary = setAsPrimary;
    $scope.modelParams = modelParams;

    function modelParams(model) {
      return _.extend($stateParams, {
        modelId: model.id
      });
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

    function setAsPrimary(model) {
      AnalysisResource.setPrimaryModel({
        analysisId: $stateParams.analysisId,
        modelId: model.id
      }, function() {
        console.log('done setting primary model');
        // update the view
      });
    }

  }
  return dependencies.concat(ModelsController);
});