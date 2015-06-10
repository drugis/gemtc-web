'use strict';
define([], function() {
  var dependencies = ['$scope', '$location', 'AnalysesResource', 'ModelResource',
    '$modalInstance', 'ProblemValidityService'];
  var AddAnalysisController = function($scope, $location, AnalysesResource, ModelResource,
    $modalInstance, ProblemValidityService) {

    $scope.analysis = {}; // we watch a property of analysis therefore obj is needed

    $scope.addAnalysis = function(analysis) {
      $scope.isAddingAnalysis = true;
      AnalysesResource.save(analysis, function(savedAnalysis) {

        ModelResource.save({
          analysisId: savedAnalysis.id
        }, {}, function(result, headers) {
          $modalInstance.close();
          $scope.isAddingAnalysis = false;
          $location.url(headers().location);
        });
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.$watch('analysis.problemFile', function(newValue, oldValue) {
      if (newValue && newValue != oldValue && isValidJsonProblem(newValue)) {
        $scope.analysis.problem = JSON.parse(newValue);
      }
    });

    function isValidJsonProblem(inputString) {
      $scope.problemValidity = ProblemValidityService.isValidJsonObjectAsString(inputString);
      // only check the problem details if we are working with a valid json object
      if ($scope.problemValidity.isValid) {
        $scope.problemValidity = ProblemValidityService.getValidity(JSON.parse(inputString));
      }
      return $scope.problemValidity.isValid;
    }
  };
  return dependencies.concat(AddAnalysisController);
});
