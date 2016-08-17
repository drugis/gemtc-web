'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', '$stateParams', 'FunnelPlotResource', 'problem', 'successCallback'];
  var AddComparisonFunnelPlotController = function($scope, $modalInstance, $stateParams, FunnelPlotResource, problem, successCallback) {
    $scope.comparisons = buildComparisons();
    $scope.savePlot = savePlot;
    $scope.cancel = cancel;

    function buildComparisons() {
      var comparisons = [];
      problem.treatments.forEach(function(treatment, idx) {
        var restOfTreatments = problem.treatments.slice(idx + 1);
        restOfTreatments.forEach(function(otherTreatment) {
          // TODO: omit comparisons without results
          comparisons.push({
            t1: treatment,
            t2: otherTreatment
          });
        });
      });
      return comparisons;
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function buildPlotObject(comparisons) {
      var includedComparisons = _.filter(comparisons, 'isIncluded');
      return {
        includedComparisons: includedComparisons.map(function(comparison) {
          return {
            t1: comparison.t1.id,
            t2: comparison.t2.id,
            biasDirection: comparison.biasDirection.id === comparison.t1.id ? 1 : 2
          };
        })
      };
    }

    function savePlot() {
      $scope.isSaving = true;

      FunnelPlotResource
        .save($stateParams, buildPlotObject($scope.comparisons))
        .$promise.then(function() {
          successCallback();
          $modalInstance.close();
        });
    }

  };
  return dependencies.concat(AddComparisonFunnelPlotController);
});
