'use strict';
define([], function() {
  var dependencies = ['$scope', '$location', 'AnalysesResource', '$modalInstance', 'ProblemValidityService'];
  var AddAnalysisController = function($scope, $location, AnalysesResource, $modalInstance, ProblemValidityService) {

    $scope.analysis = {
      title: undefined,
      outcome: undefined,
      problem: undefined
    };

    $scope.addAnalysis = function(analysis) {
      $scope.isAddingAnalysis = true;
      AnalysesResource.save(analysis, function(savedAnalysis, headers) {
        $modalInstance.close();
        $scope.isAddingAnalysis = false;
        $location.url(headers().location);
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }

    $scope.$watch('analysis.problemFile', function(newValue, oldValue) {
      if (newValue && newValue != oldValue && checkIfFileIsValidJsonProblem(newValue)) {
        $scope.analysis.problem = JSON.parse(newValue, 1);
      }
    });

    function checkIfFileIsValidJsonProblem(inputString) {
      $scope.problemValidity = ProblemValidityService.isValidJsonObjectAsString(inputString);
      // only check the problem details if we are working with a valid json object
      if($scope.problemValidity.isValid) {
       $scope.problemValidity = ProblemValidityService.getValidity(JSON.parse(inputString));
      } 
      return $scope.problemValidity.isValid;
    }

  }
  return dependencies.concat(AddAnalysisController);
});