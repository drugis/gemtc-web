'use strict';
define(['lodash'], function (_) {
  var dependencies = [];
  var ResultsPlotService = function () {
    function prefixImageUris(plotObj, resultPlotPrefix) {
      return _.reduce(
        plotObj,
        function (accum, plot, key) {
          var newPlot = _.cloneDeep(plot);
          newPlot.href = resultPlotPrefix + plot.href;
          accum[key] = newPlot;
          return accum;
        },
        {}
      );
    }

    return {
      prefixImageUris
    };
  };
  return dependencies.concat(ResultsPlotService);
});
