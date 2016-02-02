'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'AnalysisService', 'EvidenceTableService'];
  var EvidenceTableController = function($scope, $stateParams, AnalysisService, EvidenceTableService) {

    $scope.analysis.$promise.then(function() {
      var studyMap = AnalysisService.problemToStudyMap($scope.analysis.problem);
      var studies = EvidenceTableService.studyMapToStudyArray(studyMap);
      $scope.outcomeType = EvidenceTableService.determineOutcomeType(studies);
      $scope.tableRows = EvidenceTableService.studyListToEvidenceRows(studies, $scope.analysis.problem.studyLevelCovariates);
    });

  };
  return dependencies.concat(EvidenceTableController);
});
