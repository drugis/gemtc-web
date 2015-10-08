'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', '$stateParams', 'ModelResource', 'model', 'successCallback'];
  var ExtendRunLengthController = function($scope, $modalInstance, $stateParams, ModelResource, model, successCallback) {

    $scope.runLengthSettings = {
      burnInIterations: model.burnInIterations,
      inferenceIterations: model.inferenceIterations,
      thinningFactor: model.thinningFactor
    };
    $scope.minBurnInIterations = $scope.runLengthSettings.burnInIterations;
    $scope.minInferenceIterations = $scope.runLengthSettings.inferenceIterations;
    $scope.isRunlengthDivisibleByThinningFactor = isRunlengthDivisibleByThinningFactor;
    $scope.isExtendButtonDisabled = isExtendButtonDisabled;
    $scope.isExtendingRunLength = false;
    $scope.extendRunLength = extendRunLength;

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    function isRunlengthDivisibleByThinningFactor() {
      return $scope.runLengthSettings.burnInIterations % $scope.runLengthSettings.thinningFactor === 0 &&
        $scope.runLengthSettings.inferenceIterations % $scope.runLengthSettings.thinningFactor === 0;
    }

    function isExtendButtonDisabled(runLengthSettings) {
      // due to 'min' property on input fields, values are undefined if lower than that minimum value
      return !runLengthSettings.burnInIterations ||
        !runLengthSettings.inferenceIterations ||
        !isRunlengthDivisibleByThinningFactor() ||
        !!$scope.isExtendingRunLength;
    }

    function extendRunLength(runLengthSettings) {
      $scope.isExtendingRunLength = true;
      ModelResource.save($stateParams, _.extend(runLengthSettings, {id: $stateParams.modelId})).$promise.then(function() {
        successCallback();
        $modalInstance.close();
      });
    }

  };
  return dependencies.concat(ExtendRunLengthController);
});
