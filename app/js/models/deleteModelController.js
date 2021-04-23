'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$modalInstance',
    '$stateParams',
    'ModelResource',
    'model',
    'callback'
  ];
  var DeleteModelController = function(
    $scope,
    $modalInstance,
    $stateParams,
    ModelResource,
    model,
    callback
  ) {
    // functions
    $scope.cancel = $modalInstance.close;
    $scope.deleteModel = deleteModel;

    // init
    $scope.model = model;

    function deleteModel() {
      ModelResource.delete(_.merge({},$stateParams,{
        modelId: $scope.model.id
      }), function() {
        callback($scope.model.id);
        $scope.cancel();
      });
    }

  };
  return dependencies.concat(DeleteModelController);
});
