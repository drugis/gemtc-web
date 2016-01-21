'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var MetaRegressionService = function() {

    /*
     ** Transform covariate effects plots object to a list of objects,
     ** each object has treatmentName and a plot for the corresponding treatment
     **
     ** The returned list is sorted by treatmentName
     */
    function buildCovariatePlotOptions(result, problem) {
      var treatmentsById = _.keyBy(problem.treatments, 'id');
      return Object
        .keys(result.results.covariateEffectPlot)
        .map(function(key) {
          return {
            treatmentName: treatmentsById[key].name,
            plot: result.results.covariateEffectPlot[key]
          };
        })
        .sort(function(a, b) {
          return a.treatmentName.localeCompare(b.treatmentName);
        });
    }

    return {
      buildCovariatePlotOptions: buildCovariatePlotOptions
    };
  };

  return dependencies.concat(MetaRegressionService);
});
