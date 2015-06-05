'use strict';
define([], function() {
  var dependencies = ['$scope', '$state','AnalysesResource', '$modalInstance'];
  var AddAnalysisController = function($scope, $state, AnalysesResource, $modalInstance) {

    $scope.addAnalysis = function(unSavedAnalysis) {
      $scope.isAddingAnalysis = true;
      AnalysesResource.save(unSavedAnalysis, function(savedAnalysis, response) {
        var final = response.headers['Location'].split('/')
        $modalInstance.close();
        $scope.isAddingAnalysis = false;
        $state.go('analysis', {analysisId: savedAnalysis.id});
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
  }
  return dependencies.concat(AddAnalysisController);
});
     
