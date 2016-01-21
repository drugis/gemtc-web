'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$state', '$stateParams', 'AnalysisResource', 'ModelResource'];
  var ModelsController = function($scope, $state, $stateParams, AnalysisResource, ModelResource) {
    $scope.modelsLoaded = false;
    $scope.analysisId = $stateParams.analysisId;
    $scope.setAsPrimary = setAsPrimary;
    $scope.modelParams = modelParams;
    $scope.loadModels = loadModels;
    $scope.gotoCreateModel = gotoCreateModel;
    $scope.gotoModel = gotoModel;
    $scope.unsetPrimary = unsetPrimary;

    $scope.loadModels();

    function modelParams(model) {
      return _.extend($stateParams, {
        modelId: model.id
      });
    }

    function loadModels() {
      $scope.models = ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
        $scope.primaryModel = result.find(function(model) {
          return model.id === $scope.analysis.primaryModel;
        });
      });
    }


    function gotoCreateModel() {
      $state.go('createModel', $stateParams);
    }

    function gotoModel(model) {
      $state.go('model', $scope.modelParams(model));
    }

    function setAsPrimary(model) {
      AnalysisResource.setPrimaryModel({
        analysisId: $stateParams.analysisId,
        modelId: model.id
      }, function() {
        console.log('done setting primary model');
        $scope.analysis.primaryModel = model.id;
        $scope.primaryModel = model;
      });
    }

    function unsetPrimary(model) {
      AnalysisResource.setPrimaryModel({
        analysisId: $stateParams.analysisId,
        modelId: null
      }, function() {
        console.log('done setting primary model');
        $scope.analysis.primaryModel = null;
        $scope.primaryModel = null;
      });
    }

  };

  return dependencies.concat(ModelsController);
});
