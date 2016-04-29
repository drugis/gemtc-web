'use strict';
define(['lodash'], function(_) {
  var dependencies = ['gemtcRootPath', 'ModelService', '$q'];
  var relativeEffectPlotsDirective = function(gemtcRootPath, ModelService, $q) {
    return {
      scope: {
        model: '=',
        resultsPromise: '=',
        problemPromise: '='
      },
      restrict: 'E',
      templateUrl: gemtcRootPath + 'js/models/result/relativeEffectPlots.html',
      link: function(scope) {

        if (scope.model.modelType.type === 'node-split') {
          return;
        }

        $q.all([scope.resultsPromise, scope.problemPromise]).then(function(resultAndProblem) {
          scope.results = resultAndProblem[0].results;
          scope.problem = resultAndProblem[1];

          if (scope.problem.treatments && scope.problem.treatments.length > 0) {
            scope.selectedBaseline = scope.problem.treatments[0];
          }

          scope.relativeEffectPlots = _.map(scope.results.relativeEffectPlots, function(plots, key) {
            return {
              level: key,
              plots: plots
            };
          });

          if (scope.model.regressor && ModelService.isVariableBinary(scope.model.regressor.variable, scope.problem)) {
            scope.relativeEffectPlots = ModelService.filterCentering(scope.relativeEffectPlots);
            scope.relativeEffectPlot = scope.relativeEffectPlots[0];
          } else {
            scope.relativeEffectPlot = ModelService.findCentering(scope.relativeEffectPlots);
            if (scope.model.regressor) {
              scope.relativeEffectPlot.level = 'centering (' + scope.result.results.regressor.modelRegressor.mu + ')';
            }
          }
        });

      }
    };
  };
  return dependencies.concat(relativeEffectPlotsDirective);
});
