'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [
    '$scope',
    '$modalInstance',
    '$stateParams',
    'ModelResource',
    'baseModel',
    'comparison',
    'successCallback'];
  var CreateNodeSplitModelController = function(
    $scope,
    $modalInstance,
    $stateParams,
    ModelResource,
    baseModel,
    comparison,
    successCallback
  ) {
    // functions
    $scope.createNodeSplitModel = createNodeSplitModel;
    $scope.cancel = $modalInstance.close;

    // init
    var modelCopy = angular.copy(baseModel);
    modelCopy.title = 'Nodesplit model (' + comparison.label + ')';
    delete modelCopy.id;
    delete modelCopy.result;
    delete modelCopy.taskUrl;
    delete modelCopy.analysisId;

    $scope.model = modelCopy;
    $scope.isCreatingModel = false;

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
