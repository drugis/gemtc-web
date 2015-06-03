'use strict';
define([], function() {
  var dependencies = ['$scope', 'AnalysesResource', '$modalInstance'];
  var AddAnalysisController = function($scope, AnalysesResource, $modalInstance) {

    $scope.addAnalysis = function(analysis) {
      $scope.isAddingAnalysis = true;
      AnalysesResource.post(analysis, function() {
        $modalInstance.close();
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
  }
  return dependencies.concat(AddAnalysisController);
});