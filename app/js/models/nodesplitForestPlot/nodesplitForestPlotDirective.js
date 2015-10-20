'use strict';
define(['d3'], function(d3) {
  var dependencies = ['$window', 'gemtcRootPath'];
  var NodesplitForestPlot = function($window, gemtcRootPath) {
    return {
      restrict: 'E',
      templateUrl: gemtcRootPath + 'js/models/nodesplitForestPlot/nodesplitForestPlot.html',
      scope: {
        consistencyEstimate: '=',
        directEstimate: '=',
        indirectEstimate: '='
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

        // Browser onresize event
        $window.onresize = function() {
          scope.$apply();
        };

        // Watch for resize event
        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, render);

        scope.$watch('consistencyEstimate', render);

        function render() {
          // clear up after resize
          svg.selectAll('*').remove();

          if (!scope.consistencyEstimate || !scope.directEstimate || !scope.indirectEstimate) {
            return;
          }

          var
            estimates = [scope.consistencyEstimate, scope.directEstimate, scope.indirectEstimate],
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
