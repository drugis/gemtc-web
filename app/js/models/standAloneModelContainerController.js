'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'AnalysisResource'];
  var StandAloneModelContainerController = function($scope, $stateParams, AnalysisResource) {
  //	$scope.analysis = AnalysisResource.get({analysisId: $stateParams.analysisId});
  }
  return dependencies.concat(StandAloneModelContainerController);
});
