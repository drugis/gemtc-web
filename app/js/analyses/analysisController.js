'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'AnalysesResource'];
  var AnalysisController = function($scope, $stateParams, AnalysesResource) {
    $scope.analysis = AnalysesResource.get($stateParams);
  }
  return dependencies.concat(AnalysisController);
});
