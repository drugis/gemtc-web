'use strict';
define([], function() {
  var dependencies = ['gemtcRootPath', '$q', 'ResultsPlotService'];
  var nodeSplitDensityPlotsDirective = function(gemtcRootPath, $q, ResultsPlotService) {
    return {
      scope: {
        modelPromise: '=',
        resultsPromise: '=',
        problemPromise: '='
      },
      restrict: 'E',
      templateUrl: 'gemtc-web/models/result/nodeSplitDensityPlots.html',
      link: function(scope) {

        $q.all([scope.modelPromise, scope.resultsPromise, scope.problemPromise])
        .then(function(modelResultProblem) {
          scope.model = modelResultProblem[0];
          scope.results = modelResultProblem[1];
          scope.problem = modelResultProblem[2];

          scope.results.nodeSplitDensityPlot = ResultsPlotService.prefixImageUris(scope.results.nodeSplitDensityPlot, scope.model.taskUrl + '/results/');
        });

      }
    };
  };
  return dependencies.concat(nodeSplitDensityPlotsDirective);
});
