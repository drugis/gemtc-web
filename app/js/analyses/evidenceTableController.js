'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$stateParams', 'AnalysisService', 'EvidenceTableService'];
  var EvidenceTableController = function($scope, $stateParams, AnalysisService, EvidenceTableService) {

    function matcherFactory(arg) {
      return function(row) {
        return row.evidence[arg];
      };
    }

    $scope.analysis.$promise.then(function() {
      var studyMap = AnalysisService.problemToStudyMap($scope.analysis.problem);
      var studies = EvidenceTableService.studyMapToStudyArray(studyMap);
      $scope.outcomeType = EvidenceTableService.determineOutcomeType(studies);
      $scope.tableRows = EvidenceTableService.studyListToEvidenceRows(studies, $scope.analysis.problem.studyLevelCovariates);
      $scope.showMean = _.find($scope.tableRows, matcherFactory('mean'));
      $scope.showStdDev = _.find($scope.tableRows, matcherFactory('stdDev'));
      $scope.showStdErr = _.find($scope.tableRows, matcherFactory('stdErr'));
      $scope.showSampleSize = _.find($scope.tableRows, matcherFactory('sampleSize'));
    });

  };
  return dependencies.concat(EvidenceTableController);
});
