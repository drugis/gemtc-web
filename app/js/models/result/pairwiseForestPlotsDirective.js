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
          scope.results = modelResultProblem[1];
          scope.problem = modelResultProblem[2];
          scope.results.studyForestPlot = _.map(scope.results.studyForestPlot, function(page) {
            return {
              href: scope.model.taskUrl + '/results/' + page.href,
              'content-type': page['content-type']
            };
          });
        });

      }
    };
  };
  return dependencies.concat(pairwiseForestPlotsDirective);
});
