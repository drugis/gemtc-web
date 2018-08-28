'use strict';
define([], function() {
  var dependencies = ['$q', 'MetaRegressionService'];
  var metaRegressionCovPlotsDirective = function($q, MetaRegressionService) {
    return {
      scope: {
        modelPromise: '=',
        resultsPromise: '=',
        problemPromise: '='
      },
      restrict: 'E',
      templateUrl: './metaRegressionCovPlots.html',
      link: function(scope) {

        $q.all([scope.modelPromise, scope.resultsPromise, scope.problemPromise])
          .then(function(modelResultProblem) {
            scope.model = modelResultProblem[0];
            scope.results = modelResultProblem[1];
            scope.problem = modelResultProblem[2];

            if (scope.model.regressor) {
              scope.results.covariateEffectPlot = _.reduce(scope.results.covariateEffectPlot, function(accum, plot, key) {
                accum[key] = {
                  'content-type': plot['content-type'],
                  href: scope.model.taskUrl + '/results/' + plot.href
                };
                return accum;
              }, {});
              scope.covariateEffectPlots = MetaRegressionService.buildCovariatePlotOptions(scope.results, scope.problem);
              scope.covariateEffectPlot = scope.covariateEffectPlots[0];
              scope.covariateQuantiles = MetaRegressionService.getCovariateSummaries(scope.results, scope.problem);
            }
          });

      }
    };
  };
  return dependencies.concat(metaRegressionCovPlotsDirective);
});
