'use strict';
define([], function() {
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

  };
  return dependencies.concat(ModelController);
});
