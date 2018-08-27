'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'AnalysisService'];
  var NetworkGraphController = function($scope, $stateParams, AnalysisService) {
    $scope.networkGraph = {};
    $scope.analysis.$promise.then(function(analysis) {
      $scope.networkGraph.network = AnalysisService.transformProblemToNetwork(analysis.problem);
    });
  };
  return dependencies.concat(NetworkGraphController);
});
