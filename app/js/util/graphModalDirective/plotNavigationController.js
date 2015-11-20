'use strict';
define([], function() {
  var dependencies = ['$scope', '$modalInstance'];
  var PlotNavigationController = function($scope, $modalInstance) {
    $scope.sortedLabels = Object.keys($scope.diagnosticsMap).sort();

    $scope.type = 'tracePlot';
    $scope.selectedIndex = $scope.sortedLabels.indexOf($scope.selectedComparison.label);
    $scope.comparisonLabel = $scope.sortedLabels[$scope.selectedIndex];

    $scope.previousComparison = function() {
      --$scope.selectedIndex;
      $scope.comparisonLabel = $scope.sortedLabels[$scope.selectedIndex];
    }
    $scope.nextComparison = function() {
      ++$scope.selectedIndex;
      $scope.comparisonLabel = $scope.sortedLabels[$scope.selectedIndex];
    }

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  }
  return dependencies.concat(PlotNavigationController);
});