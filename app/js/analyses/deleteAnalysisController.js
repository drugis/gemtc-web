'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'AnalysisResource',
    'analysis'
  ];
  var DeleteAnalysisController = function(
    $scope,
    $modalInstance,
    AnalysisResource,
    analysis
  ) {
    // functions
    $scope.cancel = $modalInstance.close;
    $scope.deleteAnalysis = deleteAnalysis;

    // init
    $scope.analysis = analysis;

    function deleteAnalysis() {
      AnalysisResource.delete({
        analysisId: $scope.analysis.id
      });
      $scope.cancel();
    }

  };
  return dependencies.concat(DeleteAnalysisController);
});
