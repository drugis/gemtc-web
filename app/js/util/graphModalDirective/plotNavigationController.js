'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', 'DiagnosticsService'];
  var PlotNavigationController = function($scope, $modalInstance, DiagnosticsService) {
    var sortedDiagnostics = _.values($scope.diagnosticsMap).sort(DiagnosticsService.compareDiagnostics);
    $scope.sortedLabels = _.map(sortedDiagnostics, 'label');

    $scope.type = 'tracePlot';
    $scope.selectedIndex = $scope.sortedLabels.indexOf($scope.selectedComparison.label);
    $scope.comparisonLabel = $scope.sortedLabels[$scope.selectedIndex];

    $scope.previousComparison = function() {
      --$scope.selectedIndex;
      $scope.comparisonLabel = $scope.sortedLabels[$scope.selectedIndex];
    };
    $scope.nextComparison = function() {
      ++$scope.selectedIndex;
      $scope.comparisonLabel = $scope.sortedLabels[$scope.selectedIndex];
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  };
  return dependencies.concat(PlotNavigationController);
});
