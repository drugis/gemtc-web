'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$modal',
    '$stateParams',
    'AnalysisService',
    'AnalysisResource',
    'EvidenceTableService'
  ];
  var EvidenceTableController = function(
    $scope,
    $modal,
    $stateParams,
    AnalysisService,
    AnalysisResource,
    EvidenceTableService
  ) {
    // functions 
    $scope.editStudyTitle = editStudyTitle;
    $scope.editTreatmentName = editTreatmentName;

    // init
    $scope.analysis.$promise.then(createEvidenceTable);
    $scope.$watch('analysis.problem.treatments', createEvidenceTable, true);

    function createEvidenceTable() {
      var studyMap = AnalysisService.problemToStudyMap($scope.analysis.problem);
      var studies = EvidenceTableService.studyMapToStudyArray(studyMap);
      $scope.outcomeType = EvidenceTableService.determineOutcomeType(studies);
      $scope.tableRows = EvidenceTableService.studyListToEvidenceRows(studies, $scope.analysis.problem.studyLevelCovariates);
      $scope.showMean = _.some($scope.tableRows, matcherFactory('mean'));
      $scope.showStdDev = _.some($scope.tableRows, matcherFactory('stdDev'));
      $scope.showStdErr = _.some($scope.tableRows, matcherFactory('stdErr'));
      $scope.showSampleSize = _.some($scope.tableRows, matcherFactory('sampleSize'));
      $scope.showExposure = _.some($scope.tableRows, matcherFactory('exposure'));
    }

    function matcherFactory(arg) {
      return function(row) {
        return row.evidence[arg];
      };
    }

    function editStudyTitle(title) {
      $modal.open({
        templateUrl: './editStudyTitle.html',
        controller: 'EditStudyTitleController',
        resolve: {
          studyTitle: function() {
            return title;
          },
          entries: function() {
            var relativeEntries = $scope.analysis.problem.relativeEffectData ? EvidenceTableService.getRelativeEntries($scope.analysis.problem.relativeEffectData.data) : [];
            return relativeEntries.concat($scope.analysis.problem.entries);
          },
          callback: function() {
            return function(newTitle) {
              var entries = $scope.analysis.problem.entries;
              $scope.analysis.problem.entries = EvidenceTableService.getNewEntries(title, newTitle, entries);
              $scope.analysis.problem.studyLevelCovariates = EvidenceTableService.updateStudyCovariates(
                $scope.analysis.problem.studyLevelCovariates,
                title,
                newTitle
              );
              EvidenceTableService.updateOmittedStudy($scope.models, title, newTitle);
              saveProblem();
            };
          }
        }
      });
    }

    function editTreatmentName(treatmentRow) {
      $modal.open({
        templateUrl: './editTreatmentName.html',
        controller: 'EditTreatmentNameController',
        resolve: {
          name: function() {
            return treatmentRow.treatmentTitle;
          },
          treatments: function() {
            return $scope.analysis.problem.treatments;
          },
          callback: function() {
            return function(newName) {
              var treatment = EvidenceTableService.findTreatment($scope.analysis.problem.treatments, treatmentRow);
              treatment.name = newName;
              saveProblem();
            };
          }
        }
      });
    }

    function saveProblem() {
      AnalysisResource.setProblem($stateParams, $scope.analysis.problem, function() {
        _.forEach($scope.models, deleteModelResults);
      });
    }

    function deleteModelResults(model) {
      delete model.taskUrl;
      delete model.runStatus;
    }

  };
  return dependencies.concat(EvidenceTableController);
});
