'use strict';
define([], function() {
  var dependencies = ['$scope', 'AnalysesResource'];
  var ModelController = function($scope, AnalysesResource) {
    $scope.analysesLoaded = false;

  	$scope.analyses = AnalysesResource.query(function() {
      $scope.analysesLoaded = true;
    });
  }
  return dependencies.concat(ModelController);
});
