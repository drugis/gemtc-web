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

    function byName(a, b) {
      return a.title.localeCompare(b.title);
    }

    function loadModels() {
      ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
        $scope.$parent.primaryModel = result.find(function(model) {
          return model.id === $scope.analysis.primaryModel;
        });
        $scope.$watch('$parent.primaryModel', function(newValue, oldValue){
          if(oldValue !== newValue) {
              setAsPrimary(newValue);
          }
        });
        $scope.$parent.models =  result.sort(byName);
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
      var modelId = primaryModel ? primaryModel.id : null;
      return AnalysisResource.setPrimaryModel(_.extend($scope.analysis, {modelId: modelId, analysisId: $scope.analysis.id}));
    }

  };

  return dependencies.concat(ModelsController);
});
