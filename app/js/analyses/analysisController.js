'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'AnalysisResource', 'NetworkPlotService'];
  var AnalysisController = function($scope, $stateParams, AnalysisResource, NetworkPlotService) {
    $scope.$parent.analysis = AnalysisResource.get($stateParams);
  }
  return dependencies.concat(AnalysisController);
});
