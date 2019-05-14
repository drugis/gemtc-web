'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$modal',
    '$stateParams',
    'AnalysisResource',
    'EvidenceTableService'
  ];
  var RelativeEvidenceTableController = function(
    $scope,
    $modal,
    $stateParams,
    AnalysisResource,
    EvidenceTableService
  ) {
    // functions 
    $scope.editStudyTitle = editStudyTitle;
    $scope.editTreatmentName = editTreatmentName;

    // init
    $scope.analysis.$promise.then(createEvidenceTable);

    function createEvidenceTable(analysis) {
      $scope.scale = analysis.problem.relativeEffectData.scale;
      $scope.tableRows = EvidenceTableService.buildRelativeEffectDataRows(analysis.problem);
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
            var relativeEntries = EvidenceTableService.getRelativeEntries($scope.analysis.problem.relativeEffectData.data);
            return relativeEntries.concat($scope.analysis.problem.entries);
          },
          callback: function() {
            return function(newTitle) {
              updateStudyTitle(title, newTitle);
              $scope.analysis.problem.studyLevelCovariates = EvidenceTableService.updateStudyCovariates(
                $scope.analysis.problem.studyLevelCovariates,
                title,
                newTitle
              );
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

    function updateStudyTitle(oldTitle, newTitle) {
      var oldStudy = $scope.analysis.problem.relativeEffectData.data[oldTitle];
      delete $scope.analysis.problem.relativeEffectData.data[oldTitle];
      $scope.analysis.problem.relativeEffectData.data[newTitle] = oldStudy;
    }

    function saveProblem() {
      AnalysisResource.setProblem($stateParams, $scope.analysis.problem, function() {
        _.forEach($scope.models, deleteModelResults);
        createEvidenceTable($scope.analysis);
      });
    }

    function deleteModelResults(model) {
      delete model.taskUrl;
      delete model.runStatus;
    }
  };
  return dependencies.concat(RelativeEvidenceTableController);
});
