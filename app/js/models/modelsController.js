'use strict';
define(['lodash', 'angular'], function(_, angular) {
  var dependencies = ['$scope', '$state', '$stateParams', 'AnalysisResource', 'ModelResource'];
  var ModelsController = function($scope, $state, $stateParams, AnalysisResource, ModelResource) {
    $scope.modelsLoaded = false;
    $scope.archivedFilter = archivedFilter;
    $scope.analysisId = $stateParams.analysisId;
    $scope.setAsPrimary = setAsPrimary;
    $scope.modelParams = modelParams;
    $scope.loadModels = loadModels;
    $scope.archiveModel = archiveModel;
    $scope.unArchiveModel = unArchiveModel;
    $scope.gotoCreateModel = gotoCreateModel;
    $scope.gotoModel = gotoModel;
    $scope.hasPrimaryLabel = hasPrimaryLabel;
    $scope.showArchived = false;
    $scope.numberOfModelsArchived = 0;
    $scope.loadModels();

    function modelParams(model) {
      return _.extend({}, $stateParams, {
        modelId: model.id
      });
    }

    function byName(a, b) {
      return a.title.localeCompare(b.title);
    }

    function loadModels() {
      ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
        $scope.$parent.analysis.$promise.then(function() {
          $scope.$parent.primaryModel = _.find(result, ['id', $scope.analysis.primaryModel]);
        });
        $scope.$watch('$parent.primaryModel', function(newValue, oldValue) {
          if (oldValue !== newValue) {
            setAsPrimary(newValue);
          }
        });
        $scope.numberOfModelsArchived = result.reduce(function(accum, model) {
          return model.archived ? ++accum : accum;
        }, 0);
        $scope.$parent.models = result.sort(byName);
      });
    }

    function archivedFilter(model) {
      if ($scope.showArchived) {
        return true;
      }
      return !model.archived;
    }

    function archiveModel(model) {
      var params = angular.copy($stateParams);
      params.modelId = model.id;
      ModelResource.setAttributes(params, {
        archived: true
      }).$promise.then(loadModels);
    }

    function unArchiveModel(model) {
      var params = angular.copy($stateParams);
      params.modelId = model.id;
      ModelResource.setAttributes(params, {
        archived: false
      }).$promise.then(loadModels);
    }

    function gotoCreateModel() {
      $state.go('createModel', $stateParams);
    }

    function gotoModel(model) {
      $state.go('model', $scope.modelParams(model));
    }

    function hasPrimaryLabel(model) {
      return model && $scope.$parent.primaryModel && model.id === $scope.$parent.primaryModel.id;
    }

    function setAsPrimary(primaryModel) {
      var modelId = primaryModel ? primaryModel.id : null;
      $scope.$emit('primaryModelSet', {
        analysisId: $scope.analysisId,
        projectId: $scope.analysis.projectId
      });
      return AnalysisResource.setPrimaryModel({
        projectId: $scope.analysis.projectId,
        analysisId: $scope.analysis.id,
        modelId: modelId
      }, null);
    }

  };

  return dependencies.concat(ModelsController);
});
