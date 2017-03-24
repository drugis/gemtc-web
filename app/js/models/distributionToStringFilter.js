'use strict';
define([], function() {
  var dependencies = [];
  var DistributionToStringFilter = function() {
    return function(distribution) {
      if(!distribution) {
        return undefined;
      }
      var distributions = {
        dnorm: 'N',
        'dbeta-logit': 'Beta',
        dt: 't'
      };
      var parameters = {
        'dbeta-logit': distribution.alpha + ', ' + distribution.beta,
        dnorm: distribution.mu + ', ' + distribution.sigma,
        dt: distribution.dof + ', ' + distribution.mu + ', ' + distribution.stdErr
      };

      return distribution.scale + ' (' + distribution.name + ') ~ ' +
        distributions[distribution.type] +
        '(' + parameters[distribution.type] + ')';
    };
  };
  return dependencies.concat(DistributionToStringFilter);
});
