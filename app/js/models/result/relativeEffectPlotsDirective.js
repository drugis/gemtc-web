'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$q', 'ModelService', 'ResultsPlotService'];
  var relativeEffectPlotsDirective = function($q, ModelService, ResultsPlotService) {
    return {
      scope: {
        modelPromise: '=',
        resultsPromise: '=',
        problemPromise: '='
      },
      restrict: 'E',
      templateUrl: './relativeEffectPlots.html',
      link: function(scope) {

        function prefixPlots(plots) {
          return _.reduce(plots, function(accum, plot, key) {
            accum[key] = ResultsPlotService.prefixImageUris(plot, scope.model.taskUrl + '/results/');
            return accum;
          }, {});
        }

        $q.all([scope.modelPromise, scope.resultsPromise, scope.problemPromise])
          .then(function(modelResultProblem) {
            scope.model = modelResultProblem[0];
            scope.results = modelResultProblem[1];
            scope.problem = modelResultProblem[2];

            if (scope.model.modelType.type === 'node-split') {
              return;
            }

            if (scope.problem.treatments && scope.problem.treatments.length) {
              scope.selectedBaseline = scope.problem.treatments[0];
            }

            scope.relativeEffectPlots = _.map(scope.results.relativeEffectPlots, function(plots, key) {
              return {
                level: key,
                plots: prefixPlots(plots)
              };
            });

            if (scope.model.regressor && ModelService.isVariableBinary(scope.model.regressor.variable, scope.problem)) {
              scope.relativeEffectPlots = ModelService.filterCentering(scope.relativeEffectPlots);
              scope.relativeEffectPlot = scope.relativeEffectPlots[0];
            } else {
              scope.relativeEffectPlot = ModelService.findCentering(scope.relativeEffectPlots);
              if (scope.model.regressor) {
                scope.relativeEffectPlot.level = 'centering (' + scope.results.regressor.modelRegressor.mu + ')';
              }
            }
          });
      }
    };
  };
  return dependencies.concat(relativeEffectPlotsDirective);
});
