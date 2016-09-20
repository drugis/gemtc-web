'use strict';
define(['d3', 'nvd3', 'lodash'], function(d3, nvd3, _) {
  var dependencies = ['gemtcRootPath'];
  var FunnelPlot = function(gemtcRootPath) {
    return {
      restrict: 'E',
      scope: {
        resultsPromise: '='
      },
      templateUrl: gemtcRootPath + 'js/models/funnelPlot/funnelPlot.html',
      link: function(scope, element) {

        scope.resultsPromise.then(render);

        function render(results) {
          var root = d3.select($(element).get(0));
          root = root.select('svg');
          scope.results = results;

          if (!results.studyRelativeEffects) {
            return; // do not render if data is missing
          }

          var midPoint = results.relativeEffects.centering[0].quantiles['50%'];
          var minY = 0;
          var maxY = 1.2 * _.max(results.studyRelativeEffects['std.err']);
          var minX = midPoint - 1.96 * maxY;
          var maxX = midPoint + 1.96 * maxY;

          nvd3.addGraph(function() {
            function drawInterval() {
              var graph = d3.select(element[0].querySelector('g'));

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

            // ensure that the comparison direction is the same for pooled relative effects
            // and study-specific ones.
            function consistentDirection(meanVal, valT1, valT2) {
              return valT1 === results.relativeEffects.centering[0].t1 && valT2 === results.relativeEffects.centering[0].t2 ?
                meanVal :
                -meanVal;
            }

            root.append("rect")
              .attr("width", "100%")
              .attr("height", "100%")
              .attr("fill", "white");

            var chart = nvd3.models.scatterChart()
              .showLegend(false)
              .color(d3.scale.category10().range())
              .xDomain([minX, maxX])
              .yDomain([maxY, minY]);
            chart.yAxis.axisLabel('Standard error');
            chart.xAxis.axisLabel('Median study effect');

            //Axis settings
            chart.xAxis.tickFormat(d3.format('.02f'));
            chart.yAxis.tickFormat(function(d) {
              return Math.abs(d);
            });

            var myData = [{
              values: results.studyRelativeEffects.mean.map(function(meanVal, idx) {
                return {
                  x: consistentDirection(meanVal, results.studyRelativeEffects.t1[idx], results.studyRelativeEffects.t2[idx]),
                  y: results.studyRelativeEffects['std.err'][idx]
                };
              })
            }];

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
