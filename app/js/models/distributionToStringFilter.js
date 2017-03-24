'use strict';
define([], function() {
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
          parameterString = distribution.mu + ', ' + distribution.sigma;
          break;
        case 'dt':
          distributionLabel = 't';
          parameterString = distribution.dof + ', ' + distribution.mu + ', ' + distribution.stdErr.toPrecision(3);
      }

      return distribution.scale + ' (' + distribution.name + ') ~ ' +
        distributionLabel + '(' + parameterString + ')';
    };
  };
  return dependencies.concat(DistributionToStringFilter);
});
