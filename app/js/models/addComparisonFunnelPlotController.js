'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', '$stateParams', 'FunnelPlotResource',
    'studyRelativeEffects', 'problem', 'successCallback'
  ];
  var AddComparisonFunnelPlotController = function($scope, $modalInstance, $stateParams, FunnelPlotResource,
    studyRelativeEffects, problem, successCallback) {
    $scope.comparisons = buildComparisons();
    $scope.savePlot = savePlot;
    $scope.cancel = cancel;
    $scope.selectAll = selectAll;
    $scope.deselectAll = deselectAll;
    $scope.isAddButtonDisabled = isAddButtonDisabled;

    function buildComparisons() {
      return problem.treatments.reduce(function(accum, treatment) {
        problem.treatments.forEach(function(otherTreatment) {
          var comparisonResults = _.find(studyRelativeEffects, function(comparisonEffects) {
            return (comparisonEffects.t1[0] === treatment.id.toString() &&
              comparisonEffects.t2[0] === otherTreatment.id.toString());
          });
          if (comparisonResults) {
            accum.push({
              t1: treatment,
              t2: otherTreatment
            });
          }
        });
        return accum;
      }, []);
    }

    function cancel() {
      $modalInstance.close();
    }

    function buildPlotObject(comparisons) {
      var includedComparisons = _.filter(comparisons, 'isIncluded');
      return {
        modelId: $stateParams.modelId,
        includedComparisons: includedComparisons.map(function(comparison) {
          return {
            t1: comparison.t1.id,
            t2: comparison.t2.id,
            biasDirection: comparison.biasDirection.id === comparison.t1.id ? "t1" : "t2"
          };
        })
      };
    }

    function isAddButtonDisabled() {
      return !_.find($scope.comparisons, function(comparison) {
        return comparison.isIncluded;
      });
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

    function selectAll() {
      _.forEach($scope.comparisons, function(comparison) {
        comparison.isIncluded = true;
        comparison.biasDirection = comparison.t1;
      });
    }

    function deselectAll() {
      _.forEach($scope.comparisons, function(comparison) {
        comparison.isIncluded = false;
      });
    }
  };
  return dependencies.concat(AddComparisonFunnelPlotController);
});
