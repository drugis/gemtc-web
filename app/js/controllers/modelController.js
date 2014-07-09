'use strict';
define(['underscore'], function() {
  var dependencies = ['$scope', '$stateParams', 'ModelResource', 'PataviService',
    'RelativeEffectsTableService', 'PataviTaskIdResource', 'ProblemResource'
  ];
  var ModelController = function($scope, $stateParams, ModelResource, PataviService,
    RelativeEffectsTableService, PataviTaskIdResource, ProblemResource) {

    function getTaskId() {
      return PataviTaskIdResource.get($stateParams);
    }

    $scope.progress = {
      percentage: 0
    };

    function nameRankProbabilities(rankProbabilities, treatments) {
      return _.reduce(_.pairs(rankProbabilities), function(memo, pair) {
        var treatmentName = _.find(treatments, function(treatment) {
          return treatment.id.toString() === pair[0];
        }).name;
        memo[treatmentName] = pair[1];
        return memo;
      }, {});
    }

    function successCallback(result) {
      return ProblemResource.get({
        analysisId: $stateParams.analysisId,
        projectId: $stateParams.projectId
      }).$promise.then(function(problem) {
        $scope.outcome = $scope.$parent.analysis.outcome;
        result.results.rankProbabilities = nameRankProbabilities(result.results.rankProbabilities, problem.treatments);
        $scope.result = result;
        var relativeEffects = result.results.relativeEffects;
        var isLogScale = result.results.logScale;
        $scope.relativeEffectsTable = RelativeEffectsTableService.buildTable(relativeEffects, isLogScale, problem.treatments);
      });
    }

    ModelResource
      .get($stateParams)
      .$promise
      .then(getTaskId)
      .then(PataviService.run)
      .then(successCallback,
        function(error) {
          console.log('an error has occurred, error: ' + error);
        }, function(update) {
          if (update && $.isNumeric(update.progress)) {
            $scope.progress.percentage = update.progress;
          }
        });


  };
  return dependencies.concat(ModelController);
});