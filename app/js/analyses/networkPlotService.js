'use strict';
define(['angular', 'lodash', 'd3'], function(angular, _, d3) {
  var dependencies = [];

  var NetworkPlotService = function() {

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

    function drawNetwork(network, element, width) {
      if (!network) {
        return;
      }
      var n = network.interventions.length;
      var angle = 2.0 * Math.PI / n;
      var originX = width / 2;
      var originY = width / 2; // use a square area
      var margin = 100;
      var radius = originY - margin;
      var circleMaxSize = 30;
      var circleMinSize = 5;
      var node = d3.select($(element).get(0));
      node.selectAll('g').remove();
      node.selectAll('line').remove();
      var svg = node.select('svg')
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

      var circleAndNameGraph = svg.selectAll('g')
        .data(_.values(circleDataMap))
        .enter()
        .append('g')
        .attr('class', 'intervention-label')
        .attr('transform', function(d) {
          return 'translate(' + d.cx + ',' + d.cy + ')';
        });

      circleAndNameGraph.append('circle')
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
      circleAndNameGraph.append('text')
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

      circleAndNameGraph
        .each(wrap, width);

    }

    function wrap(texts, width) {
      var g = d3.select(this);
      texts.each(function(textNode) {
        var text = d3.select(textNode),
          y = textNode.cy,
          dy = 0,
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          gx = textNode.cx,
          maxWidth = text.attr('text-anchor') === 'end' ? gx : width - gx,
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        tspan.text(text);
        word = words.pop();
        while (word) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > maxWidth) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
          word = words.pop();
        }
        var calcwidth = tspan.node().getComputedTextLength();
        console.log(calcwidth);
      });
    }

    return {
      drawNetwork: drawNetwork
    };

  };

  return dependencies.concat(NetworkPlotService);
});
