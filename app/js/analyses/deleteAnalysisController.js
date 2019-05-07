'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'AnalysisResource',
    'analysis',
    'callback'
  ];
  var DeleteAnalysisController = function(
    $scope,
    $modalInstance,
    AnalysisResource,
    analysis,
    callback
  ) {
    // functions
    $scope.cancel = $modalInstance.close;
    $scope.deleteAnalysis = deleteAnalysis;

    // init
    $scope.analysis = analysis;

    function deleteAnalysis() {
      AnalysisResource.delete({
        analysisId: $scope.analysis.id
      }, function() {
        callback($scope.analysis.id);
        $scope.cancel();
      });
    }

  };
  return dependencies.concat(DeleteAnalysisController);
});
