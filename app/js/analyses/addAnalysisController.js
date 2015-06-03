'use strict';
define([], function() {
  var dependencies = ['$scope', 'AnalysesResource', '$modalInstance', 'callback'];
  var AddAnalysisController = function($scope, AnalysesResource, $modalInstance, callback) {

    $scope.addAnalysis = function(analysis) {
      $scope.isAddingAnalysis = true;
      AnalysesResource.save(analysis, function() {
        $modalInstance.close();
        callback();
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
  }
  return dependencies.concat(AddAnalysisController);
});