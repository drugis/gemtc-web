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
      var distributionScaleLabel = distribution.scale;
      switch (distribution.type) {
        case 'dbeta-logit':
          distributionLabel = 'Beta';
          distributionScaleLabel = 'probability';
          parameterString = distribution.alpha + ', ' + distribution.beta;
          break;
        case 'dnorm':
          distributionLabel = 'N';
          parameterString = format3Precision(distribution.mu) + ', ' + format3Precision(distribution.sigma);
          break;
        case 'dt':
          distributionLabel = 't';
          parameterString = distribution.dof + ', ' + format3Precision(distribution.mu) + ', ' + format3Precision(distribution.stdErr);
          break;
        case 'dsurv' :
          distributionLabel = 'Gamma';
          parameterString = distribution.alpha + ', ' + distribution.beta;
          break;
        case 'dbeta-cloglog' :
          distributionLabel = 'Beta';
          distributionScaleLabel = 'hazard ratio';
          parameterString = distribution.alpha + ', ' + distribution.beta;
      }

      return distributionScaleLabel + ' (' + distribution.name + ') ~ ' +
        distributionLabel + '(' + parameterString + ')';
    };
  };
  return dependencies.concat(DistributionToStringFilter);
});
