'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'AnalysisService', 'EvidenceTableService'];
  var RelativeEffectTableController = function($scope, $stateParams, AnalysisService, EvidenceTableService) {

    $scope.analysis.$promise.then(function(analysis) {
      $scope.scale = analysis.problem.relativeEffectData.scale;
      $scope.tableRows = EvidenceTableService.buildRelativeEffectDataRows(analysis.problem);
    });

  };
  return dependencies.concat(RelativeEffectTableController);
});
