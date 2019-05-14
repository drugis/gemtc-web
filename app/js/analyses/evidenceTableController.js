'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$modal',
    '$stateParams',
    'AnalysisService',
    'AnalysisResource',
    'EvidenceTableService',
    'ModelResource'
  ];
  var EvidenceTableController = function(
    $scope,
    $modal,
    $stateParams,
    AnalysisService,
    AnalysisResource,
    EvidenceTableService,
    ModelResource
  ) {
    // functions 
    $scope.editStudyTitle = editStudyTitle;

    // init
    $scope.analysis.$promise.then(createEvidenceTable);

    function createEvidenceTable() {
      var studyMap = AnalysisService.problemToStudyMap($scope.analysis.problem);
      var studies = EvidenceTableService.studyMapToStudyArray(studyMap);
      $scope.outcomeType = EvidenceTableService.determineOutcomeType(studies);
      $scope.tableRows = EvidenceTableService.studyListToEvidenceRows(studies, $scope.analysis.problem.studyLevelCovariates);
      $scope.showMean = _.find($scope.tableRows, matcherFactory('mean'));
      $scope.showStdDev = _.find($scope.tableRows, matcherFactory('stdDev'));
      $scope.showStdErr = _.find($scope.tableRows, matcherFactory('stdErr'));
      $scope.showSampleSize = _.find($scope.tableRows, matcherFactory('sampleSize'));
      $scope.showExposure = _.find($scope.tableRows, matcherFactory('exposure'));
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

              updateStudyCovariates(title, newTitle);
              updateOmmittedStudy(title, newTitle);

              AnalysisResource.setProblem($stateParams, $scope.analysis.problem, function() {
                _.forEach($scope.models, function(model) {
                  delete model.taskUrl;
                  delete model.runStatus;
                });
                createEvidenceTable();
              });
            };
          }
        }
      });
    }


    function updateStudyCovariates(oldTitle, newTitle) {
      if ($scope.analysis.problem.studyLevelCovariates) {
        var oldCovariate = $scope.analysis.problem.studyLevelCovariates[oldTitle];
        delete $scope.analysis.problem.studyLevelCovariates[oldTitle];
        $scope.analysis.problem.studyLevelCovariates[newTitle] = oldCovariate;
      }
    }

    function updateOmmittedStudy(oldTitle, newTitle) {
      _.forEach($scope.models, function(model) {
        if (model.sensitivity && model.sensitivity.omittedStudy === oldTitle) {
          model.sensitivity.omittedStudy = newTitle;
          ModelResource.setSensitivity(_.merge({}, $stateParams, {
            modelId: model.id
          }), model.sensitivity, null);
        }
      });
    }
  };
  return dependencies.concat(EvidenceTableController);
});
