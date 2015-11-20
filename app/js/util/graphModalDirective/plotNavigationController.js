'use strict';
define([], function() {
  var dependencies = ['$scope', '$modalInstance'];
  var PlotNavigationController = function($scope, $modalInstance) {

    $scope.type = 'tracePlot';

    $scope.selectedIndex = $scope.gelmanDiagnostics.indexOf($scope.selectedDiagnostic);
    $scope.comparisonLabel = $scope.gelmanDiagnostics[$scope.selectedIndex].label;

    $scope.previousComparison = function() {
      --$scope.selectedIndex;
      $scope.comparisonLabel = $scope.gelmanDiagnostics[$scope.selectedIndex].label;
    }
    $scope.nextComparison = function() {
      ++$scope.selectedIndex;
      $scope.comparisonLabel = $scope.gelmanDiagnostics[$scope.selectedIndex].label;
    }

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  }
  return dependencies.concat(PlotNavigationController);
});