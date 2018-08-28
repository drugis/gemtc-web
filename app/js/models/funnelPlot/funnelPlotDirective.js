'use strict';
define(['d3', 'nvd3', 'lodash'], function(d3, nvd3, _) {
  var dependencies = ['FunnelPlotService'];
  var FunnelPlot = function(FunnelPlotService) {
    return {
      restrict: 'E',
      scope: {
        resultsPromise: '='
      },
      templateUrl: './funnelPlot.html',
      link: function(scope, element) {

        scope.resultsPromise.then(function(results) {

          // ensure that the comparison direction is the same for pooled relative effects
          // and study-specific ones.
          function consistentDirection(meanVal, valT1, valT2) {
            return valT1 === results.relativeEffects.centering[0].t1 && valT2 === results.relativeEffects.centering[0].t2 ?
              meanVal :
              -meanVal;
          }

          if (!results.studyRelativeEffects) {
            return; // do not render if data is missing
          }
          scope.results = results;

          var myData = [{
            values: results.studyRelativeEffects.mean.map(function(meanVal, idx) {
              return {
                x: consistentDirection(meanVal, results.studyRelativeEffects.t1[idx], results.studyRelativeEffects.t2[idx]),
                y: results.studyRelativeEffects['std.err'][idx]
              };
            })
          }];

          var maxY = 1.2 * _.max(results.studyRelativeEffects['std.err']);
          var midPoint = results.relativeEffects.centering[0].quantiles['50%'];
          var xAxisLabel = 'Median study effect';
          var showLegend = false;

          FunnelPlotService.render(element,
            myData,
            midPoint,
            maxY,
            showLegend,
            xAxisLabel);
        });

      }
    };
  };
  return dependencies.concat(FunnelPlot);
});
