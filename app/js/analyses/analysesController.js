'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$modal',
    'AnalysisResource',
    'PageTitleService'
  ];
  var ModelController = function(
    $scope,
    $modal,
    AnalysisResource,
    PageTitleService
  ) {
    $scope.createAnalysisDialog = createAnalysisDialog;
    $scope.deleteAnalysis = deleteAnalysis;

    $scope.analysesLoaded = false;
    loadAnalyses();
    PageTitleService.setPageTitle('AnalysesController', 'Analyses');

    function loadAnalyses() {
      $scope.analyses = AnalysisResource.query(function() {
        $scope.analysesLoaded = true;
      });
    }

    function createAnalysisDialog() {
      $modal.open({
        templateUrl: './addAnalysis.html',
        scope: $scope,
        controller: 'AddAnalysisController'
      });
    }

    function deleteAnalysis(analysis) {
      $modal.open({
        templateUrl: './deleteAnalysis.html',
        scope: $scope,
        controller: 'DeleteAnalysisController',
        resolve: {
          analysis: function() {
            return analysis;
          },
          callback: function() {
            return function(analysisId){
              $scope.analyses = _.reject($scope.analyses, ['id', analysisId]);
            };
          }
        }
      });
    }

  };
  return dependencies.concat(ModelController);
});
