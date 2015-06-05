'use strict';
define([], function() {
  var dependencies = ['$scope', '$location','AnalysesResource', '$modalInstance'];
  var AddAnalysisController = function($scope, $location, AnalysesResource, $modalInstance) {

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
  }
  return dependencies.concat(AddAnalysisController);
});
     
