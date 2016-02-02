'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = ['$scope', '$modalInstance', '$stateParams', 'ModelResource', 'problem', 'baseModel', 'successCallback'];
  var CreateNetworkModelModelController = function($scope, $modalInstance, $stateParams, ModelResource, problem, baseModel, successCallback) {

    var modelCopy = angular.copy(baseModel);
    delete modelCopy.result;
    modelCopy.title = 'Network model';
    modelCopy.id = null;

    $scope.model = modelCopy;
    $scope.isCreatingModel = false;
    $scope.createNodeSplitModel = createNodeSplitModel;
    $scope.modelTypeLabel = 'network';

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    function createNodeSplitModel(model) {
      $scope.isCreatingModel = true;
      model.modelType.type = 'network';
      ModelResource.save(_.omit($stateParams, 'modelId'), model).$promise.then(function() {
        successCallback();
        $modalInstance.close();
      });
    }

  };
  return dependencies.concat(CreateNetworkModelModelController);
});
