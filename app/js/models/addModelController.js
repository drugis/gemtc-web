'use strict';
define([], function() {
  var dependencies = ['$http', '$scope', '$stateParams', '$modalInstance', 'ModelResource'];
  var AddModelController = function($http, $scope, $stateParams, $modalInstance, ModelResource) {

    $scope.addModel = function(model) {
      $scope.isAddingModel = true;
      ModelResource.save($stateParams, model, function(result, headers) {
        $modalInstance.close();
        $scope.isAddingAnalysis = false;
        $scope.loadModels();
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  };
  return dependencies.concat(AddModelController);
});
