'use strict';
define(['d3', 'nvd3', 'lodash'], function(d3, nvd3, _) {
  var dependencies = [];
  var FunnelPlotService = function() {

    function render(element, data, midPoint, maxY, showLegend, xAxisLabel) {
      var root = d3.select($(element).get(0));
      root = root.select('svg');

      var minY = 0;
      var triangleBottomLeft = midPoint - 1.96 * maxY;
      var triangleBottomRight = midPoint + 1.96 * maxY;
      var minX = _.min([triangleBottomLeft, _.min(_.map(data[0].values, 'x'))]);
      var maxX = _.max([triangleBottomRight, _.max(_.map(data[0].values, 'x'))]);

      nvd3.addGraph(function() {
        function drawInterval() {
          var graph = root.select('g');

          graph.append('line')
            .style('stroke', 'black')
            .style('stroke-dasharray', '5,10,5')
            .attr('x1', chart.xScale()(triangleBottomLeft))
            .attr('y1', chart.yScale()(maxY))
            .attr('x2', chart.xScale()(midPoint))
            .attr('y2', chart.yScale()(0));

          graph.append('line')
            .style('stroke', 'black')
            .style('stroke-dasharray', '5,10,5')
            .attr('x1', chart.xScale()(midPoint))
            .attr('y1', chart.yScale()(0))
            .attr('x2', chart.xScale()(triangleBottomRight))
            .attr('y2', chart.yScale()(maxY));

          graph.append('line')
            .style('stroke', 'black')
            .style('stroke-dasharray', '5,10,5')
            .attr('x1', chart.xScale()(midPoint))
            .attr('y1', chart.yScale()(0))
            .attr('x2', chart.xScale()(midPoint))
            .attr('y2', chart.yScale()(maxY));
        }



        var chart = nvd3.models.scatterChart()
          .showLegend(showLegend)
          .color(d3.scale.category10().range())
          .xDomain([minX, maxX])
          .yDomain([maxY, minY]);
        chart.yAxis.axisLabel('Standard error');
        chart.xAxis.axisLabel(xAxisLabel);
        //Axis settings
        chart.xAxis.tickFormat(d3.format('.02f'));
            chart.yAxis.tickFormat(function(d) {
              return Math.abs(d);
            });
                    // chart.yAxis.tickFormat(d3.format('.02f'));

        root.append('rect')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('fill', 'white');

        root
          .style('width', '500px')
          .style('height', '500px')
          .style('background', 'white')
          .datum(data)
          .call(chart);
        drawInterval();

        nvd3.utils.windowResize(function() {
          root.selectAll('*').remove();
          chart.update();
          drawInterval();
        });

        return chart;
      });
    }

    return {
      render: render
    };

  };

  return dependencies.concat(FunnelPlotService);
});