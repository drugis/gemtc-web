'use strict';
define(['lodash'], function(_) {
  var dependencies = [];
  var ResultsPlotService = function() {

    function prefixImageUris(plotObj, resultPlotPrefix) {
      return _.reduce(plotObj, function(accum, plot, key) {
        plot.href = resultPlotPrefix + plot.href;
        accum[key] = plot;
        return accum;
      }, {});
    }

    return {
      prefixImageUris: prefixImageUris
    };
  };
  return dependencies.concat(ResultsPlotService);
});
