'use strict';
define(['d3', 'nvd3', 'lodash'], function(d3, nvd3, _) {

  function measuringSameComparison(comparison, comparisonEffects) {
    return (
      (comparison.t1.toString() === comparisonEffects.t1[0] && comparison.t2.toString() === comparisonEffects.t2[0]) ||
      (comparison.t1.toString() === comparisonEffects.t2[0] && comparison.t2.toString() === comparisonEffects.t1[0])
    );
  }

  var dependencies = ['$q', 'gemtcRootPath'];
  var FunnelPlot = function($q, gemtcRootPath) {
    return {
      restrict: 'E',
      scope: {
        plotData: '=',
        problemPromise: '=',
        resultsPromise: '='
      },
      templateUrl: gemtcRootPath + 'js/models/funnelPlot/funnelPlot.html',
      link: function(scope, element) {
        $q.all([scope.resultsPromise, scope.problemPromise]).then(render);

        function findComparisonForRelativeEffect(relativeEffect) {
          return _.find(scope.plotData.includedComparisons, function(comparison) {
            return measuringSameComparison(comparison, relativeEffect);
          });
        }

        function render(promiseResults) {
          var root = d3.select($(element).get(0));
          root = root.select('svg');

          var results = promiseResults[0].results;
          var problem = promiseResults[1];
          var treatmentsById = _.keyBy(problem.treatments, 'id');
          scope.results = results;

          if (!results.studyRelativeEffects) {
            return; // do not render if data is missing
          }

          var includedRelativeEffects = _.filter(results.studyRelativeEffects, function(relativeEffect) {
            return findComparisonForRelativeEffect(relativeEffect);
          });

          var midPoint = 0;
          var minY = 0;
          var maxY = 1.2 * _.max(_.map(includedRelativeEffects, function(relativeEffects) {
            return _.max(relativeEffects['std.err']);
          }));
          var minX = midPoint - 1.96 * maxY;
          var maxX = midPoint + 1.96 * maxY;

          nvd3.addGraph(function() {
            function drawInterval() {
              var graph = root.select('g');

              graph.append('line')
                .style('stroke', 'black')
                .style('stroke-dasharray', '5,10,5')
                .attr('x1', chart.xScale()(minX))
                .attr('y1', chart.yScale()(maxY))
                .attr('x2', chart.xScale()(midPoint))
                .attr('y2', chart.yScale()(0));

              graph.append('line')
                .style('stroke', 'black')
                .style('stroke-dasharray', '5,10,5')
                .attr('x1', chart.xScale()(midPoint))
                .attr('y1', chart.yScale()(0))
                .attr('x2', chart.xScale()(maxX))
                .attr('y2', chart.yScale()(maxY));

              graph.append('line')
                .style('stroke', 'black')
                .style('stroke-dasharray', '5,10,5')
                .attr('x1', chart.xScale()(midPoint))
                .attr('y1', chart.yScale()(0))
                .attr('x2', chart.xScale()(midPoint))
                .attr('y2', chart.yScale()(maxY));
            }


            // (delta(i, t1, t2) - d(t1, t2)) * dir
            // ensure that the comparison direction is the same for pooled relative effects
            // and study-specific ones. Then adjust so the difference from pooled effect is shown.
            function normalisedStudyDifference(comparison, pooledRelativeEffect, studyEffects, idx) {
              var pooledEffectSize = pooledRelativeEffect.quantiles['50%'];
              var difference = studyEffects.t1[idx] === pooledRelativeEffect.t1 &&
                studyEffects.t2[idx] === pooledRelativeEffect.t2 ?
                  studyEffects.mean[idx] - pooledEffectSize :
                  studyEffects.mean[idx] + pooledEffectSize ;
              return comparison.biasDirection === 1? difference : -1 * difference;
            }

            root.append("rect")
              .attr("width", "100%")
              .attr("height", "100%")
              .attr("fill", "white");

            var chart = nvd3.models.scatterChart()
              .color(d3.scale.category10().range())
              .xDomain([minX, maxX])
              .yDomain([maxY, minY]);
            chart.yAxis.axisLabel('Standard error');
            chart.xAxis.axisLabel('Effect centered at comparison-specific pooled effect');

            //Axis settings
            chart.xAxis.tickFormat(d3.format('.02f'));
            chart.yAxis.tickFormat(d3.format('.02f'));

            var myData = _.map(includedRelativeEffects, function(studyEffectsForComparison) {
              var pooledRelativeEffect = _.find(results.relativeEffects.centering, function(relativeEffect) {
                return measuringSameComparison(relativeEffect, studyEffectsForComparison);
              });
              var comparison = findComparisonForRelativeEffect(pooledRelativeEffect);
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

            root
              .style('width', '500px')
              .style('height', '500px')
              .datum(myData)
              .call(chart);

            chart.dispatch.on('renderEnd', drawInterval);
            nvd3.utils.windowResize(function() {
              root.selectAll('*').remove();
              chart.update();
              drawInterval();
            });

            return chart;
          });
        }
      }
    };
  };
  return dependencies.concat(FunnelPlot);
});
