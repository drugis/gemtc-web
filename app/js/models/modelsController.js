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
    $scope.hasPrimaryLabel = hasPrimaryLabel;
    $scope.setAsPrimary = setAsPrimary;
    $scope.archivedFilter = archivedFilter;
    $scope.editModelTitle = editModelTitle;

    //init
    $scope.modelsLoaded = false;
    $scope.analysisId = $stateParams.analysisId;
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
        $scope.$parent.analysis.$promise.then(function() {
          $scope.$parent.primaryModel = _.find(result, ['id', $scope.analysis.primaryModel]);
        });
        setPrimaryModelWatcher();
        $scope.numberOfModelsArchived = countArchivedModels(result);
        $scope.$parent.models = result.sort(byNameSorter);
      });
    }

    function byNameSorter(a, b) {
      return a.title.localeCompare(b.title);
    }

    function setPrimaryModelWatcher() {
      $scope.$watch('$parent.primaryModel', function(newValue, oldValue) {
        if (oldValue !== newValue) {
          setAsPrimary(newValue);
        }
      });
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

    function hasPrimaryLabel(model) {
      return model && $scope.$parent.primaryModel && model.id === $scope.$parent.primaryModel.id;
    }

    function editModelTitle(model){
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
  };

  return dependencies.concat(ModelsController);
});
