'use strict';
define([], function() {
  var dependencies = ['gemtcRootPath', 'MetaRegressionService', '$q'];
  var metaRegressionCovPlotsDirective = function(gemtcRootPath, MetaRegressionService, $q) {
    return {
      scope: {
        modelPromise: '=',
        resultsPromise: '=',
        problemPromise: '='
      },
      restrict: 'E',
      templateUrl: gemtcRootPath + 'js/models/result/metaRegressionCovPlots.html',
      link: function(scope) {

        $q.all([scope.modelPromise, scope.resultsPromise, scope.problemPromise])
          .then(function(modelResultProblem) {
            scope.model = modelResultProblem[0];
            scope.results = modelResultProblem[1].results;
            scope.problem = modelResultProblem[2];

            if (scope.model.regressor) {
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
