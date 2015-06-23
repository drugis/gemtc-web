'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'NetworkPlotService'];
  var NetworkGraphController = function($scope, $stateParams, NetworkPlotService) {
    $scope.networkGraph = {};
    $scope.analysis.$promise.then(function(analysis) {
      $scope.networkGraph.network = NetworkPlotService.transformProblemToNetwork(analysis.problem);
    });
  }
  return dependencies.concat(NetworkGraphController);
});