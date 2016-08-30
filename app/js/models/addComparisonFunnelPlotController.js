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

    function buildComparisons() {
      var comparisons = [];
      problem.treatments.forEach(function(treatment, idx) {
        var restOfTreatments = problem.treatments.slice(idx + 1);
        restOfTreatments.forEach(function(otherTreatment) {
          var comparisonResults = _.find(studyRelativeEffects, function(comparisonEffects) {
            return (comparisonEffects.t1[0] === treatment.id.toString() &&
                comparisonEffects.t2[0] === otherTreatment.id.toString()) ||
              (comparisonEffects.t2[0] === treatment.id.toString() &&
                comparisonEffects.t1[0] === otherTreatment.id.toString());
          });
          if (comparisonResults) {
            comparisons.push({
              t1: treatment,
              t2: otherTreatment
            });
          }
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
