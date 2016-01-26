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
    $scope.hasPimaryLabel = hasPimaryLabel;
    $scope.loadModels();

    function modelParams(model) {
      return _.extend($stateParams, {
        modelId: model.id
      });
    }

    function loadModels() {
      $scope.$parent.models = ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
        $scope.$parent.primaryModel = result.find(function(model) {
          return model.id === $scope.analysis.primaryModel;
        });
        $scope.$watch('$parent.primaryModel', function(newValue, oldValue){
          if(oldValue !== newValue) {
              setAsPrimary(newValue);
          }
        });
      });
    }

    function gotoCreateModel() {
      $state.go('createModel', $stateParams);
    }

    function gotoModel(model) {
      $state.go('model', $scope.modelParams(model));
    }

    function hasPimaryLabel(model) {
      return model && $scope.$parent.primaryModel && model.id === $scope.$parent.primaryModel.id;
    }

    function setAsPrimary(primaryModel) {
      return AnalysisResource.setPrimaryModel({
        analysisId: $stateParams.analysisId,
        id: $stateParams.analysisId,
        projectId: $stateParams.projectId,
        modelId: primaryModel ? primaryModel.id : null
      });
    }

  };

  return dependencies.concat(ModelsController);
});
