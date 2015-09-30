'use strict';
define(['angular', 'lodash', 'd3'], function(angular, _, d3) {
  var dependencies = ['AnalysisService'];

  var NetworkPlotService = function(AnalysisService) {

    function drawEdge(enter, fromId, toId, width, circleData) {
      enter.append('line')
        .attr('x1', circleData[fromId].cx)
        .attr('y1', circleData[fromId].cy)
        .attr('x2', circleData[toId].cx)
        .attr('y2', circleData[toId].cy)
        .attr('stroke', 'black')
        .attr('stroke-width', width);
    }

    function tanh(x) {
      var y = Math.exp(2 * x);
      return (y - 1) / (y + 1);
    }

    function drawNetwork(network, width, height) {
      var n = network.interventions.length;
      var angle = 2.0 * Math.PI / n;
      var originX = width / 2;
      var originY = width / 2; // use a squere area
      var margin = 200;
      var radius = originY - margin / 2;
      var circleMaxSize = 30;
      var circleMinSize = 5;
      d3.select('#network-graph').selectAll('g').remove();
      d3.select('#network-graph').selectAll('line').remove();
      var svg = d3.select('#network-graph').select('svg')
        .attr('width', width)
        .attr('height', width);


      var circleDataMap = {};

      _.each(network.interventions, function(intervention, i) {
        var circleDatum = {
          id: intervention.name,
          r: circleMinSize + ((circleMaxSize - circleMinSize) * tanh(intervention.sampleSize / 10000)),
          cx: originX - radius * Math.cos(angle * i),
          cy: originY + radius * Math.sin(angle * i)
        };
        circleDataMap[intervention.name] = circleDatum;

      });

      _.each(network.edges, function(edge) {
        drawEdge(svg, edge.from.name, edge.to.name, edge.studies.length, circleDataMap);
      });

      var enter = svg.selectAll('g')
        .data(_.values(circleDataMap))
        .enter()
        .append('g')
        .attr('transform', function(d) {
          return 'translate(' + d.cx + ',' + d.cy + ')';
        });

      enter.append('circle')
        .style('fill', 'grey')
        .attr('r', function(d) {
          return d.r;
        });

      var labelMargin = 5;
      var nearCenterMargin = 20;

      function nearCenter(d) {
        var delta = d.cx - originX;
        return delta < -nearCenterMargin ? -1 : (delta > nearCenterMargin ? 1 : 0);
      }

      var cos45 = Math.sqrt(2) * 0.5;
      enter.append('text')
        .attr('dx', function(d) {
          var offset = cos45 * d.r + labelMargin;
          return nearCenter(d) * offset;
        })
        .attr('dy', function(d) {
          var offset = (nearCenter(d) === 0 ? d.r : cos45 * d.r) + labelMargin;
          return (d.cy >= originY ? offset : -offset);
        })
        .attr('text-anchor', function(d) {
          switch (nearCenter(d)) {
            case -1:
              return 'end';
            case 0:
              return 'middle';
            case 1:
              return 'start';
          }
        })
        .attr('dominant-baseline', function(d) {
          if (nearCenter(d) !== 0) {
            return 'central';
          }
          if (d.cy - originY < 0) {
            return 'alphabetic';
          } // text-after-edge doesn't seem to work in Chrome
          return 'text-before-edge';
        })
        .style('font-family', 'Droid Sans')
        .style('font-size', 16)
        .text(function(d) {
          return d.id;
        });
    }

    return {
      drawNetwork: drawNetwork
    };

  };

  return dependencies.concat(NetworkPlotService);
});
