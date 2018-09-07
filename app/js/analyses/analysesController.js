'use strict';
define([], function() {
  var dependencies = ['$scope', '$modal', 'AnalysisResource'];
  var ModelController = function($scope, $modal, AnalysisResource) {
    $scope.analysesLoaded = false;
    loadAnalyses();

    function loadAnalyses() {
      $scope.analyses = AnalysisResource.query(function() {
        $scope.analysesLoaded = true;
      });
    }

    $scope.createAnalysisDialog = function() {
      $modal.open({
        templateUrl: 'gemtc-web/js/analyses/addAnalysis.html',
        scope: $scope,
        controller: 'AddAnalysisController'
      });
    };

  };
  return dependencies.concat(ModelController);
});
