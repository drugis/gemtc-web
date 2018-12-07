'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    'EvidenceTableService'
  ];
  var RelativeEvidenceTableController = function(
    $scope,
    EvidenceTableService
  ) {

    $scope.analysis.$promise.then(function(analysis) {
      $scope.scale = analysis.problem.relativeEffectData.scale;
      $scope.tableRows = EvidenceTableService.buildRelativeEffectDataRows(analysis.problem);
    });

  };
  return dependencies.concat(RelativeEvidenceTableController);
});
