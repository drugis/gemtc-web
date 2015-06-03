'use strict';
define([], function() {
  var dependencies = ['$scope', '$modal', 'AnalysesResource'];
  var ModelController = function($scope, $modal, AnalysesResource) {
    $scope.analysesLoaded = false;

    function loadAnalyses() {
      $scope.analyses = AnalysesResource.query(function(result) {
        $scope.analysesLoaded = true;
      });
    }

    loadAnalyses();

    $scope.createDatasetDialog = function() {
      $modal.open({
        templateUrl: './js/analyses/addAnalysis.html',
        scope: $scope,
        controller: 'AddAnalysisController',
        resolve: {
          callback: function() {
            return loadAnalyses;
          }
        }
      });
    };
  }
  return dependencies.concat(ModelController);
});