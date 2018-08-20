'use strict';
define(['d3', 'nvd3', 'lodash'], function(d3, nvd3, _) {

  function isComparisonForTreatments(comparison, t1, t2) {
    return (
      (comparison.t1.toString() === t1 && comparison.t2.toString() === t2) ||
      (comparison.t1.toString() === t2 && comparison.t2.toString() === t1)
    );
  }

  var dependencies = ['$q', 'gemtcRootPath', 'FunnelPlotService'];
  var FunnelPlot = function($q, gemtcRootPath, FunnelPlotService) {
    return {
      restrict: 'E',
      scope: {
        plotData: '=',
        problemPromise: '=',
        resultsPromise: '='
      },
      templateUrl: 'gemtc-web/models/funnelPlot/funnelPlot.html',
      link: function(scope, element) {
        $q.all([scope.resultsPromise, scope.problemPromise]).then(function(promiseResults) {
          var results = promiseResults[0];
          var problem = promiseResults[1];

          if (!results.studyRelativeEffects) {
            return; // do not render if data is missing
          }
          scope.results = results;

          var treatmentsById = _.keyBy(problem.treatments, 'id');
          var includedRelativeEffects = _.filter(results.studyRelativeEffects, function(relativeEffect) {
            return findComparisonForTreatments(relativeEffect.t1[0], relativeEffect.t2[0]);
          });

          var myData = _.map(includedRelativeEffects, function(studyEffectsForComparison) {
            var pooledRelativeEffect = _.find(results.relativeEffects.centering, function(relativeEffect) {
              return isComparisonForTreatments(relativeEffect, studyEffectsForComparison.t1[0], studyEffectsForComparison.t2[0]);
            });
            var comparison = findComparisonForTreatments(pooledRelativeEffect.t1, pooledRelativeEffect.t2);
            return {
              key: treatmentsById[pooledRelativeEffect.t1].name + ' - ' + treatmentsById[pooledRelativeEffect.t2].name,
              values: studyEffectsForComparison.mean.map(function(meanVal, idx) {
                return {
                  x: normalisedStudyDifference(comparison, pooledRelativeEffect, studyEffectsForComparison, idx),
                  y: studyEffectsForComparison['std.err'][idx]
                };
              })
            };
          });
          
          var maxY = 1.2 * _.max(_.map(includedRelativeEffects, function(relativeEffects) {
            return _.max(relativeEffects['std.err']);
          }));
          var midPoint = 0;
          var xAxisLabel = 'Effect centered at comparison-specific pooled effect';
          var showLegend = true;

          FunnelPlotService.render(
            element, 
            myData, 
            midPoint, 
            maxY, 
            showLegend,
            xAxisLabel);
        });

        function findComparisonForTreatments(t1, t2) {
          return _.find(scope.plotData.includedComparisons, function(comparison) {
            return isComparisonForTreatments(comparison, t1, t2);
          });
        }
        // (delta(i, t1, t2) - d(t1, t2)) * dir
        // ensure that the comparison direction is the same for pooled relative effects
        // and study-specific ones. Then adjust so the difference from pooled effect is shown.
        function normalisedStudyDifference(comparison, pooledRelativeEffect, studyEffects, idx) {
          if (comparison.t1.toString() !== studyEffects.t1[idx]) {
            throw new Error('comparison and study effect direction must be the same');
          }
          var pooledEffectSize = pooledRelativeEffect.quantiles['50%'];
          var difference = studyEffects.t1[idx] === pooledRelativeEffect.t1 ?
            studyEffects.mean[idx] - pooledEffectSize :
            studyEffects.mean[idx] + pooledEffectSize;
          return comparison.biasDirection === 't1' ? difference : -1 * difference;
        }

      }
    };
  };
  return dependencies.concat(FunnelPlot);
});
