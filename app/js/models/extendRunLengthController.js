'use strict';
define(['lodash', 'moment'], function(_, moment) {
  var dependencies = ['$scope', '$modalInstance', '$stateParams', 'AnalysisService', 'ModelResource', 'problem', 'model', 'successCallback'];
  var ExtendRunLengthController = function($scope, $modalInstance, $stateParams, AnalysisService, ModelResource, problem, model, successCallback) {

    $scope.model = model;

    $scope.minBurnInIterations = $scope.model.burnInIterations;
    $scope.minInferenceIterations = $scope.model.inferenceIterations;
    $scope.isRunlengthDivisibleByThinningFactor = isRunlengthDivisibleByThinningFactor;
    $scope.isExtendButtonDisabled = isExtendButtonDisabled;
    $scope.isExtendingRunLength = false;
    $scope.extendRunLength = extendRunLength;
    $scope.estimatedRunLengthHumanized = estimateHumanizedRunLength();
    $scope.$watch('model', estimateHumanizedRunLength, true); // deep watch

    function estimateHumanizedRunLength() {
      $scope.estimatedRunLength = AnalysisService.estimateRunLength(problem, $scope.model);
      $scope.estimatedRunLengthHumanized = moment.duration($scope.estimatedRunLength, 'seconds').humanize();
    }

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    function isRunlengthDivisibleByThinningFactor(model) {
      return model.burnInIterations % model.thinningFactor === 0 &&
        model.inferenceIterations % model.thinningFactor === 0;
    }

    function isExtendButtonDisabled(model) {
      // due to 'min' property on input fields, values are undefined if lower than that minimum value
      return !model.burnInIterations ||
        !model.inferenceIterations ||
        !isRunlengthDivisibleByThinningFactor(model) ||
        !!$scope.isExtendingRunLength;
    }

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
