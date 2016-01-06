'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modal', '$state', '$stateParams', 'gemtcRootPath', 'ModelResource', 'PataviService',
    'RelativeEffectsTableService', 'PataviTaskIdResource', 'ProblemResource', 'AnalysisResource',
    'DiagnosticsService', 'AnalysisService', 'DevianceStatisticsService'
  ];
  var ModelController = function($scope, $modal, $state, $stateParams, gemtcRootPath, ModelResource, PataviService,
    RelativeEffectsTableService, PataviTaskIdResource, ProblemResource, AnalysisResource, DiagnosticsService, AnalysisService,
    DevianceStatisticsService) {

    $scope.resultsViewTemplate = gemtcRootPath + 'views/results-section.html';
    $scope.modelSettingsViewTemplate = gemtcRootPath + 'views/model-settings-section.html';
    $scope.convergenceDiagnosticsViewTemplate = gemtcRootPath + 'views/convergence-diagnostics-section.html';
    $scope.modelFitViewTemplate = gemtcRootPath + 'views/model-fit-section.html';

    $scope.analysis = AnalysisResource.get($stateParams);
    $scope.progress = {
      percentage: 0
    };
    $scope.model = ModelResource.get($stateParams);
    $scope.$parent.model = $scope.model;
    $scope.openRunLengthDialog = openRunLengthDialog;
    $scope.selectedBaseline = undefined;
    $scope.stateParams = $stateParams;

    // pass information to parent for use in beardcrumbs
    $scope.$parent.model = $scope.model;
    $scope.$parent.analysis = $scope.analysis;

    $scope.model
      .$promise
      .then(getTaskId)
      .then(PataviService.run)
      .then(pataviRunSuccessCallback,
        function(pataviError) {
          console.error('an error has occurred, error: ' + JSON.stringify(pataviError));
          $scope.$emit('error', {
            type: 'patavi',
            message: pataviError.desc
          });
        },
        function(update) {
          if (update && $.isNumeric(update.progress)) {
            $scope.progress.percentage = update.progress;
          }
        });

    function getTaskId() {
      return PataviTaskIdResource.get($stateParams);
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

    function openRunLengthDialog() {
      $modal.open({
        windowClass: 'small',
        templateUrl: gemtcRootPath + 'js/models/extendRunLength.html',
        scope: $scope,
        controller: 'ExtendRunLengthController',
        resolve: {
          problem: function() {
            return $scope.problem;
          },
          model: function() {
            return angular.copy($scope.model);
          },
          successCallback: function() {
            return function() {
              // reload page, with empty params object
              $state.go($state.current, {}, {
                reload: true
              });
            };
          }
        }
      });
    }


    function pataviRunSuccessCallback(result) {
      return ProblemResource.get({
        analysisId: $stateParams.analysisId,
        projectId: $stateParams.projectId
      }).$promise.then(function(problem) {
        $scope.problem = problem;
        $scope.nodeSplitOptions = AnalysisService.createNodeSplitOptions(problem);
        $scope.result = result;
        if (problem.treatments && problem.treatments.length > 0) {
          $scope.selectedBaseline = problem.treatments[0];
        }
        var isLogScale = result.results.logScale;
        $scope.scaleName = AnalysisService.getScaleName($scope.model);
        $scope.diagnosticMap = DiagnosticsService.buildDiagnosticMap(
          $scope.model,
          $scope.problem,
          $scope.result
        );

        var unsorted = _.values($scope.diagnosticMap);
        $scope.diagnostics = unsorted.sort(DiagnosticsService.compareDiagnostics);

        if ($scope.model.modelType.type !== 'node-split') {
          var relativeEffects = result.results.relativeEffects;
          result.results.rankProbabilities = nameRankProbabilities(result.results.rankProbabilities, problem.treatments);
          $scope.relativeEffectsTable = RelativeEffectsTableService.buildTable(relativeEffects, isLogScale, problem.treatments);
        }
        $scope.devianceStatisticsTable = DevianceStatisticsService.buildTable(result.results.devianceStatistics, problem);
        if ($scope.model.regressor) {
          $scope.controlTreatment = _.find(problem.treatments, function(treatment) {
            return treatment.id == $scope.model.regressor.control;
          });
        }
        $scope.model = ModelResource.get($stateParams); // refresh so that model.taskId is set
      });
    }



  };
  return dependencies.concat(ModelController);
});