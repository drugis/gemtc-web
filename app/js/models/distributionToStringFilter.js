'use strict';
define([], function() {
  function format3Precision(number) {
    return parseFloat(number.toPrecision(3));
  }
  var dependencies = [];
  var DistributionToStringFilter = function() {
    return function(distribution) {
      if (!distribution) {
        return undefined;
      }

      var distributionLabel;
      var parameterString;
      switch (distribution.type) {
        case 'dbeta-logit':
          distributionLabel = 'Beta';
          parameterString = distribution.alpha + ', ' + distribution.beta;
          break;
        case 'dnorm':
          distributionLabel = 'N';
          parameterString = format3Precision(distribution.mu) + ', ' + format3Precision(distribution.sigma);
          break;
        case 'dt':
          distributionLabel = 't';
          parameterString = distribution.dof + ', ' + format3Precision(distribution.mu) + ', ' + format3Precision(distribution.stdErr);
      }

      return distribution.scale + ' (' + distribution.name + ') ~ ' +
        distributionLabel + '(' + parameterString + ')';
    };
  };
  return dependencies.concat(DistributionToStringFilter);
});
