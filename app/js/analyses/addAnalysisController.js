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

    $scope.$watch('analysis.problem', function(newValue, oldValue) {
      if (newValue && newValue != oldValue) {
        $scope.problemValidity = ProblemValidityService.getValidity(JSON.parse(newValue, 1));
        analysis.problem = JSON.parse(analysis.problem);
      }
    });

  }
  return dependencies.concat(AddAnalysisController);
});
