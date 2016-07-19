'use strict';
define(['d3', 'nvd3', 'lodash'], function(d3, nvd3, _) {
  var dependencies = [];
  var FunnelPlot = function() {
    return {
      restrict: 'E',
      scope: {
        resultsPromise: '='
      },
      link: function(scope, element) {

        var root = d3.select(element[0])
              .append('svg');

        scope.resultsPromise.then(render);

        function render(resultss) {

          var
            results = resultss.results,
            midPoint = results.relativeEffects.centering[0].quantiles['50%'],
            minY = 0,
            maxY = Math.max(2, _.max(results.studyRelativeEffects['std.err'])),
            minX = (-1.96  + midPoint) * maxY,
            maxX = (1.96  + midPoint) * maxY;

          nvd3.addGraph(function() {
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
            chart.yAxis.tickFormat(function(d){ return Math.abs(d);});

            var myData = [{
              values: results.studyRelativeEffects.mean.map(function(meanVal, idx) {
                return {
                  x: meanVal,
                  y: results.studyRelativeEffects['std.err'][idx] // '-' : hack to invert y axis
                };
              })
            }];

            root
              .style('width', '500')
              .style('height', '500')
              .datum(myData)
              .call(chart)

              ;
            chart.dispatch.on('renderEnd', function() {
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
            });
            nvd3.utils.windowResize(chart.update);


            return chart;
          });
        }
      }
    };
  };
  return dependencies.concat(FunnelPlot);
});
