'use strict';
define([], function() {
  var dependencies = ['gemtcRootPath', '$q'];
  var pairwiseForestPlotsDirective = function(gemtcRootPath, $q) {
    return {
      scope: {
        modelPromise: '=',
        resultsPromise: '=',
        problemPromise: '='
      },
      restrict: 'E',
      templateUrl: gemtcRootPath + 'js/models/result/pairwiseForestPlots.html',
      link: function(scope) {

        $q.all([scope.modelPromise, scope.resultsPromise, scope.problemPromise])
        .then(function(modelResultProblem) {
          scope.model = modelResultProblem[0];
          scope.results = modelResultProblem[1].results;
          scope.problem = modelResultProblem[2];

          if (scope.model.modelType.type !== 'pairwise') {
            return;
          }

        });

      }
    };
  };
  return dependencies.concat(pairwiseForestPlotsDirective);
});
