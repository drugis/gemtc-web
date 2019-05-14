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

    // init
    $scope.analysis.$promise.then(createEvidenceTable);

    function createEvidenceTable(analysis) {
      $scope.scale = analysis.problem.relativeEffectData.scale;
      $scope.tableRows = EvidenceTableService.buildRelativeEffectDataRows(analysis.problem);
    }

    function editStudyTitle(title){
      $modal.open({
        templateUrl: './editStudyTitle.html',
        controller: 'EditStudyTitleController',
        resolve:{
          studyTitle: function(){
            return title;
          },
          entries: function(){
            var relativeEntries = EvidenceTableService.getRelativeEntries($scope.analysis.problem.relativeEffectData.data);
            return relativeEntries.concat($scope.analysis.problem.entries);
          },
          callback: function(){
            return function(newTitle){
              updateStudyTitle(title, newTitle);
              updateStudyCovariates(title, newTitle);
              AnalysisResource.setProblem($stateParams, $scope.analysis.problem, function(){
                _.forEach($scope.models, function(model) {
                  delete model.taskUrl;
                  delete model.runStatus;
                });
                createEvidenceTable($scope.analysis);
              });
            };
          }
        }
      });
    }

    function updateStudyTitle(oldTitle, newTitle){
      var oldStudy = $scope.analysis.problem.relativeEffectData.data[oldTitle];
      delete $scope.analysis.problem.relativeEffectData.data[oldTitle];
      $scope.analysis.problem.relativeEffectData.data[newTitle] = oldStudy;
    }
    
    function updateStudyCovariates(oldTitle, newTitle){
      if($scope.analysis.problem.studyLevelCovariates){
        var oldCovariate = $scope.analysis.problem.studyLevelCovariates[oldTitle];
        delete $scope.analysis.problem.studyLevelCovariates[oldTitle];
        $scope.analysis.problem.studyLevelCovariates[newTitle] = oldCovariate;
      }
    }
  };
  return dependencies.concat(RelativeEvidenceTableController);
});
