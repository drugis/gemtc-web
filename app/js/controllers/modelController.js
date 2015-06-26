'use strict';
define(['lodash'], function() {
  var dependencies = ['$scope', '$stateParams', 'ModelResource', 'PataviService',
    'RelativeEffectsTableService', 'PataviTaskIdResource', 'ProblemResource', 'AnalysisResource'
  ];
  var ModelController = function($scope, $stateParams, ModelResource, PataviService,
    RelativeEffectsTableService, PataviTaskIdResource, ProblemResource, AnalysisResource) {

    $scope.analysis = AnalysisResource.get($stateParams);

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
        result.results.rankProbabilities = nameRankProbabilities(result.results.rankProbabilities, problem.treatments);
        $scope.result = result;
        var relativeEffects = result.results.relativeEffects;
        var isLogScale = result.results.logScale;
        $scope.relativeEffectsTable = RelativeEffectsTableService.buildTable(relativeEffects, isLogScale, problem.treatments);
      });
    }

    $scope.model = ModelResource.get($stateParams);
    $scope.$parent.model = $scope.model;
    $scope.model
      .$promise
      .then(getTaskId)
      .then(PataviService.run)
      .then(successCallback,
        function(error) {
          console.log('an error has occurred, error: ' + JSON.stringify(error));
        },
        function(update) {
          if (update && $.isNumeric(update.progress)) {
            $scope.progress.percentage = update.progress;
          }
        });


  };
  return dependencies.concat(ModelController);
});