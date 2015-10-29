'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', '$stateParams', 'ModelResource', 'problem', 'baseModel', 'comparison', 'successCallback'];
  var CreateNodeSplitModelController = function($scope, $modalInstance, $stateParams, ModelResource, problem, baseModel, comparison, successCallback) {

    var modelCopy = angular.copy(baseModel);
    modelCopy.title = 'Nodesplit model (' + comparison.label + ')';
    delete modelCopy.id;
    delete modelCopy.result;
    delete modelCopy.taskId;
    delete modelCopy.analysisId;

    $scope.model = modelCopy;
    $scope.isCreatingModel = false;
    $scope.createNodeSplitModel = createNodeSplitModel;

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    function createNodeSplitModel(model) {
      $scope.isCreatingModel = true;
      model.modelType.type = 'node-split';
      model.modelType.details = {
        from: _.omit(comparison.from, 'sampleSize'),
        to: _.omit(comparison.to, 'sampleSize')
      };
      ModelResource.save(_.omit($stateParams, 'modelId'), model).$promise.then(function() {
        successCallback();
        $modalInstance.close();
      });
    }

  };
  return dependencies.concat(CreateNodeSplitModelController);
});