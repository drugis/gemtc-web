'use strict';
define([], function() {
  var dependencies = ['$scope', '$modalInstance', '$stateParams', 'ModelResource', 'problem', 'model', 'successCallback'];
  var ExtendRunLengthController = function($scope, $modalInstance, $stateParams, ModelResource, problem, model, successCallback) {

    $scope.model = model;
    $scope.extendRunLength = extendRunLength;
    $scope.isExtendingRunLength = false;
    $scope.isRunLengthsAbovePrevious = isRunLengthsAbovePrevious;

    var
      minBurnInIterations = $scope.model.burnInIterations,
      minInferenceIterations = $scope.model.inferenceIterations;

    $scope.$watch('model', isRunLengthsAbovePrevious, true);

    function isRunLengthsAbovePrevious() {
      return $scope.model.burnInIterations >= minBurnInIterations &&
        $scope.model.inferenceIterations >= minInferenceIterations;
    }

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    function extendRunLength(model) {
      $scope.isExtendingRunLength = true;
      ModelResource.save($stateParams, model).$promise.then(function() {
        successCallback();
        $modalInstance.close();
      });
    }

  };
  return dependencies.concat(ExtendRunLengthController);
});