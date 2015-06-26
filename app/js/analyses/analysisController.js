'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'AnalysisResource', 'NetworkPlotService'];
  var AnalysisController = function($scope, $stateParams, AnalysisResource, NetworkPlotService) {
  	$scope.networkGraph = {};
    $scope.analysis = AnalysisResource.get($stateParams, function(analysis) {
      $scope.networkGraph.network = NetworkPlotService.transformProblemToNetwork(analysis.problem);
    });
  }
  return dependencies.concat(AnalysisController);
});
