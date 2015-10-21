'use strict';
define(['d3'], function(d3) {
  var dependencies = ['gemtcRootPath'];
  var NodesplitForestPlot = function(gemtcRootPath) {
    return {
      restrict: 'E',
      scope: {
        estimates: '='
      },
      link: function(scope, element, attrs) {
        var margin = 10,
          topMargin = 10,
          rowHeight = 14,
          labelWidth = 75,
          estimateWidth = 140,
          totalWidth = 350,
          svg = d3.select(element[0])
            .append("svg")
            .style('width', totalWidth + 'px')
            .style('height', '50px')
            .style('stroke', 'black');

        scope.$watch('estimates', render);

        function render() {

          if (scope.estimates.some(function(item) {
              return item === undefined;
            })) {
            return;
          }

          // clear up after resize
          svg.selectAll('*').remove();

          var estimates = scope.estimates,
            width = d3.select(element[0]).node().offsetWidth - margin,
            minLower = d3.min(estimates, function(d) {
              return d.lower;
            }),
            maxUpper = d3.max(estimates, function(d) {
              return d.upper;
            }),
            scale = d3.scale.linear()
              .domain([minLower, maxUpper])
              .range([labelWidth + margin, totalWidth - estimateWidth - margin]);

          svg.selectAll('line')
            .data(estimates)
            .enter()
            .append('line')
            .attr('x1', function(d) {
              return scale(d.lower);
            })
            .attr('y1', function(d, i) {
              return topMargin + i * rowHeight;
            })
            .attr('x2', function(d) {
              return scale(d.upper);
            })
            .attr('y2', function(d, i) {
              return topMargin + i * rowHeight;
            })
            .attr('stroke-width', '1')
          ;

          svg.selectAll('text')
            .data(estimates)
            .enter();

          var texts = svg.selectAll('text')
            .data(estimates)
            .enter();

          texts
            .append('text')
            .attr('x', totalWidth - estimateWidth)
            .attr('dy', function(d, i) {
              return i + 1 + 'em';
            })
            .attr('stroke-width', 0)
            .text(function(d) {
              return d.mean.toFixed(3) + ' (' + d.lower.toFixed(3) + ', ' + d.upper.toFixed(3) + ')';
            })
          ;
          texts
            .append('text')
            .attr('x', 0)
            .attr('dy', function(d, i) {
              return i + 1 + 'em';
            })
            .attr('stroke-width', 0)
            .text(function(d) {
              return d.label;
            })
          ;

          svg.selectAll('circle')
            .data(estimates)
            .enter()
            .append('circle')
            .attr('fill', '#fff')
            .attr('cx', function(d) {
              return scale(d.mean);
            })
            .attr('cy', function(d, i) {
              return topMargin + i * rowHeight;
            })
            .attr('r', 5)
            .attr('stroke-width', '1')
          ;
        }
      }
    };
  };
  return dependencies.concat(NodesplitForestPlot);
});
