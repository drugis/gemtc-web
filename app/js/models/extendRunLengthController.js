'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', '$stateParams', 'ModelResource', 'runLengthSettings', 'successCallback'];
  var ExtendRunLengthController = function($scope, $modalInstance, $stateParams, ModelResource, runLengthSettings, successCallback) {

    $scope.runLengthSettings = runLengthSettings;
    $scope.minBurnInIterations = runLengthSettings.burnInIterations;
    $scope.minInferenceIterations = runLengthSettings.inferenceIterations;
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
      return
        !runLengthSettings.burnInIterations ||
        !runLengthSettings.inferenceIterations ||
        !isRunlengthDivisibleByThinningFactor()
        !!isExtendingRunLength;
    }

    function extendRunLength(runLengthSettings) {
      $scope.isExtendingRunLength = true;
      ModelResource.extendRunLength($stateParams, runLengthSettings).$promise.then(function() {
        successCallback();
        $modalInstance.close();
      });
    }

  };
  return dependencies.concat(ExtendRunLengthController);
});
