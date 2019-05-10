'use strict';
define(['lodash', 'angular'], function(_, angular) {
  var dependencies = [
    '$scope',
    '$state',
    '$stateParams',
    '$modal',
    'AnalysisResource',
    'ModelResource'
  ];
  var ModelsController = function(
    $scope,
    $state,
    $stateParams,
    $modal,
    AnalysisResource,
    ModelResource
  ) {
    // functions
    $scope.archiveModel = archiveModel;
    $scope.gotoCreateModel = gotoCreateModel;
    $scope.gotoModel = gotoModel;
    $scope.unArchiveModel = unArchiveModel;
    $scope.setPrimaryModel = setPrimaryModel;
    $scope.archivedFilter = archivedFilter;
    $scope.editModelTitle = editModelTitle;
    $scope.deleteModel = deleteModel;
    $scope.getPrimaryModelTitle = getPrimaryModelTitle;
    $scope.removePrimary = removePrimary;

    //init
    $scope.modelsLoaded = false;
    $scope.showArchived = false;
    $scope.numberOfModelsArchived = 0;
    loadModels();

    function getModelParams(model) {
      return _.extend({}, $stateParams, {
        modelId: model.id
      });
    }

    function loadModels() {
      ModelResource.query($stateParams, function(result) {
        $scope.modelsLoaded = true;
        $scope.numberOfModelsArchived = countArchivedModels(result);
        $scope.$parent.models = result.sort(byNameSorter);
      });
    }

    function byNameSorter(a, b) {
      return a.title.localeCompare(b.title);
    }

    function setPrimaryModel() {
      return AnalysisResource.setPrimaryModel({
        projectId: $scope.analysis.projectId,
        analysisId: $scope.analysis.id,
        modelId: $scope.analysis.primaryModel
      }, null, function() {
        evictFromFrontEndCache();
      });
    }

    function evictFromFrontEndCache() { //For ADDIS
      $scope.$emit('primaryModelSet', {
        analysisId: $scope.analysis.id,
        projectId: $scope.analysis.projectId
      });
    }

    function removePrimary() {
      $scope.$parent.analysis.primaryModel = null;
      setPrimaryModel();
    }

    function countArchivedModels(models) {
      return _.reduce(models, function(accum, model) {
        return model.archived ? ++accum : accum;
      }, 0);
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
      $state.go('model', getModelParams(model));
    }

    function editModelTitle(model) {
      $modal.open({
        templateUrl: './editModelTitle.html',
        scope: $scope,
        controller: 'EditModelTitleController',
        resolve: {
          modelTitle: function() {
            return model.title;
          },
          callback: function() {
            return function(newTitle) {
              ModelResource.setTitle(getModelParams(model), {
                newTitle: newTitle
              }, function() {
                model.title = newTitle;
              });
            };
          }
        }
      });
    }

    function deleteModel(model) {
      $modal.open({
        templateUrl: './deleteModel.html',
        scope: $scope,
        controller: 'DeleteModelController',
        resolve: {
          model: function() {
            return model;
          },
          callback: function() {
            return function(modelId) {
              $scope.$parent.models = _.reject($scope.$parent.models, ['id', modelId]);
            };
          }
        }
      });
    }

    function getPrimaryModelTitle() {
      var primaryModel = _.find($scope.$parent.models, ['id', $scope.$parent.analysis.primaryModel]);
      return primaryModel ? primaryModel.title : '';
    }
  };

  return dependencies.concat(ModelsController);
});
