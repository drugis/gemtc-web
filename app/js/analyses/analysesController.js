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
    // functions
    $scope.createAnalysisDialog = createAnalysisDialog;

    // init
    PageTitleService.setPageTitle('AnalysesController', 'Analyses');
    $scope.analysesLoaded = false;
    loadAnalyses();

    function loadAnalyses() {
      $scope.analyses = AnalysisResource.query(function() {
        $scope.analysesLoaded = true;
      });
    }

    function createAnalysisDialog() {
      $modal.open({
        templateUrl: './js/analyses/addAnalysis.html',
        scope: $scope,
        controller: 'AddAnalysisController'
      });
    }

  };
  return dependencies.concat(ModelController);
});
