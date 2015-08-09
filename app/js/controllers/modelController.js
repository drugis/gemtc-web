'use strict';
define(['lodash'], function() {
  var dependencies = ['$scope', '$sce', '$stateParams', 'ModelResource', 'PataviService',
    'RelativeEffectsTableService', 'PataviTaskIdResource', 'ProblemResource', 'AnalysisResource',
    'DiagnosticsService', 'ModelService', 'AnalysisService'
  ];
  var ModelController = function($scope, $sce, $stateParams, ModelResource, PataviService,
    RelativeEffectsTableService, PataviTaskIdResource, ProblemResource, AnalysisResource, DiagnosticsService, ModelService, AnalysisService) {

    $scope.analysis = AnalysisResource.get($stateParams);
    $scope.progress = {
      percentage: 0
    };
    $scope.model = ModelResource.get($stateParams);
    $scope.$parent.model = $scope.model;
    $scope.isConvergencePlotsShown = false;
    $scope.showConvergencePlots = showConvergencePlots;
    $scope.hideConvergencePlots = hideConvergencePlots;

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

    function getTaskId() {
      return PataviTaskIdResource.get($stateParams);
    }

    function showConvergencePlots() {
      $scope.isConvergencePlotsShown = true;
    }

    function hideConvergencePlots() {
      $scope.isConvergencePlotsShown = false;
    }

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
        $scope.problem = problem;
        $scope.result = result;
        var isLogScale = result.results.logScale;
        $scope.scaleName = AnalysisService.getScaleName($scope.model);
        $scope.gelmanDiagnostics = DiagnosticsService.labelDiagnostics(result.results.gelmanDiagnostics, $scope.problem.treatments)
        if ($scope.model.modelType.type !== 'node-split') {
          var relativeEffects = result.results.relativeEffects;
          result.results.rankProbabilities = nameRankProbabilities(result.results.rankProbabilities, problem.treatments);
          $scope.relativeEffectsTable = RelativeEffectsTableService.buildTable(relativeEffects, isLogScale, problem.treatments);
        }
      });
    }



  };
  return dependencies.concat(ModelController);
});