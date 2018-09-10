'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    'AnalysisService',
    'PageTitleService'
  ];
  var NetworkGraphController = function(
    $scope,
    AnalysisService,
    PageTitleService
  ) {
    $scope.networkGraph = {};
    $scope.analysis.$promise.then(function(analysis) {
      $scope.networkGraph.network = AnalysisService.transformProblemToNetwork(analysis.problem);
      PageTitleService.setPageTitle('NetworkGraphController', analysis.title);
    });
  };
  return dependencies.concat(NetworkGraphController);
});
