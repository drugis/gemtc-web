'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'AnalysisResource'];
  var AnalysisController = function($scope, $stateParams, AnalysisResource) {
    $scope.$parent.analysis = AnalysisResource.get($stateParams);
  };
  return dependencies.concat(AnalysisController);
});
