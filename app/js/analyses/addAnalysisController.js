'use strict';
define([], function() {
  var dependencies = ['$scope', '$location', 'AnalysesResource', '$modalInstance', 'ProblemValidityService'];
  var AddAnalysisController = function($scope, $location, AnalysesResource, $modalInstance, ProblemValidityService) {

    $scope.analysis = {title: undefined, outome:undefined, problem:undefined};

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

    function isString(value) {
      return (typeof value == 'string' || value instanceof String)
    }

    $scope.$watch('analysis.problem', function(newValue, oldValue) {
      if (newValue && newValue != oldValue && isString(newValue)) {
        var problem = JSON.parse(newValue);
        $scope.problemValidity = ProblemValidityService.getValidity(problem);
        $scope.analysis.problem = problem;
      }
    });

  }
  return dependencies.concat(AddAnalysisController);
});
