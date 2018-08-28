'use strict';
define([], function() {
  var dependencies = [];
  var HeterogeneityPriorDirective = function() {
    return {
      restrict: 'E',
      templateUrl: './heterogeneityPrior.html',
      scope: {
        prior: '='
      },
      link: function(scope) {
        var labels = {
          'dgamma': 'gamma',
          'dlnorm': 'log-normal',
          'dunif': 'uniform',
          'prec': 'precision',
          'std.dev': 'standard deviation',
          'var': 'variance'
        };
        scope.priorType = labels[scope.prior.type];
        scope.priorDistribution = labels[scope.prior.distr];
        scope.param1 = scope.prior.args[0];
        scope.param2 = scope.prior.args[1];


      }
    };
  };
  return dependencies.concat(HeterogeneityPriorDirective);
});
