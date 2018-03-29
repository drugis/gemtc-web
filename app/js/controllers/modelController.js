'use strict';
define(['lodash', 'clipboard'], function(_, Clipboard) {
  var dependencies = ['$scope', '$q', '$http', '$modal', '$state', '$stateParams', '$window', 'gemtcRootPath', 'ModelResource', 'ModelBaselineResource',
    'FunnelPlotResource', 
    'PataviService',
    'RelativeEffectsTableService', 
    'PataviTaskIdResource', 
    'ProblemResource', 
    'AnalysisResource', 
    'ModelService',
    'DiagnosticsService', 
    'AnalysisService', 
    'DevianceStatisticsService', 
    'MetaRegressionService',
    'ResultsPlotService'
  ];
  var ModelController = function($scope, $q, $http, $modal, $state, $stateParams, $window, gemtcRootPath, ModelResource, ModelBaselineResource,
    FunnelPlotResource, 
    PataviService,
    RelativeEffectsTableService, 
    PataviTaskIdResource, 
    ProblemResource, 
    AnalysisResource, 
    ModelService,
    DiagnosticsService, 
    AnalysisService, 
    DevianceStatisticsService, 
    MetaRegressionService,
    ResultsPlotService) {
    // functions
    $scope.openRunLengthDialog = openRunLengthDialog;
    $scope.openComparisonAdjustedModal = openComparisonAdjustedModal;
    $scope.openBaselineDistributionModal = openBaselineDistributionModal;
    $scope.goToModelData = goToModelData;
    $scope.goToRefineModel = goToRefineModel;
    $scope.goToRScript = goToRScript;

    // init
    $scope.analysis = AnalysisResource.get($stateParams);
    ModelBaselineResource.get($stateParams).$promise.then(function(result) {
      $scope.baselineDistribution = result.baseline;
    });
    $scope.progress = {
      percentage: 0
    };
    var modelDefer = $q.defer();
    $scope.model = ModelResource.get($stateParams);
    $scope.modelPromise = modelDefer.promise;
    $scope.comparisonAdjustedFunnelPlots = FunnelPlotResource.query($stateParams);
    $scope.resultsViewTemplate = gemtcRootPath + 'views/results-section.html';
    $scope.modelSettingsViewTemplate = gemtcRootPath + 'views/model-settings-section.html';
    $scope.convergenceDiagnosticsViewTemplate = gemtcRootPath + 'views/convergence-diagnostics-section.html';
    $scope.modelFitViewTemplate = gemtcRootPath + 'views/model-fit-section.html';
    $scope.metaRegressionTemplate = gemtcRootPath + 'views/meta-regression-section.html';
    $scope.stateParams = $stateParams;
    new Clipboard('.clipboard-button');
    $scope.selectedBaseline = undefined;

    // pass information to parent for use in breadcrumbs
    $scope.$parent.model = $scope.model;
    $scope.$parent.analysis = $scope.analysis;

    $scope.resultsPromise = $scope.model
      .$promise
      .then(getTaskInfo)
      .then(getTaskUrl)
      .then(getTaskDetails)
      .then(PataviService.listen)
      .then(pataviRunSuccessCallback,
        function(pataviError) {
          console.error('an error has occurred, error: ' + JSON.stringify(pataviError));
          $scope.$emit('error', {
            type: 'PATAVI',
            message: pataviError.desc
          });
        },
        function(update) {
          if (update && update.eventType === 'progress' && update.eventData && $.isNumeric(update.eventData.progress)) {
            $scope.progress.percentage = update.eventData.progress;
          }
        });

    function goToRefineModel() {
      $state.go('refineModel', $stateParams);
    }

    function getTaskInfo() {
      return PataviTaskIdResource.get($stateParams).$promise;
    }

    function getTaskUrl(taskInfo) {
      $scope.taskUri = taskInfo.uri;
      return taskInfo.uri;
    }

    function getTaskDetails(taskUrl) {
      $http.get(taskUrl).then(function(response) {
        $scope.taskInfo = response.data;
      });
      return taskUrl;
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
            return $scope.model;
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

    function openComparisonAdjustedModal() {
      $modal.open({
        windowClass: 'small',
        templateUrl: gemtcRootPath + 'js/models/addComparisonFunnelPlot.html',
        scope: $scope,
        controller: 'AddComparisonFunnelPlotController',
        resolve: {
          problem: function() {
            return $scope.problem;
          },
          studyRelativeEffects: function() {
            return $scope.result.studyRelativeEffects;
          },
          successCallback: function() {
            return function() {
              $scope.comparisonAdjustedFunnelPlots = FunnelPlotResource.query($stateParams);
            };
          }
        }
      });
    }

    $scope.problemPromise = ProblemResource.get({
      analysisId: $stateParams.analysisId,
      projectId: $stateParams.projectId
    }).$promise;

    function prefixPlots(result, taskUri) {
      var resultPlotPrefix = taskUri + '/results/';
      result.convergencePlots.trace = ResultsPlotService.prefixImageUris(result.convergencePlots.trace, resultPlotPrefix);
      result.convergencePlots.density = ResultsPlotService.prefixImageUris(result.convergencePlots.density, resultPlotPrefix);
      result.convergencePlots.psrf = ResultsPlotService.prefixImageUris(result.convergencePlots.psrf, resultPlotPrefix);
      result.deviancePlot = ResultsPlotService.prefixImageUris(result.deviancePlot, resultPlotPrefix);
      return result;
    }

    function pataviRunSuccessCallback(result) {
      return $scope.problemPromise.then(function(problem) {
        $scope.problem = problem;
        $scope.nodeSplitOptions = AnalysisService.createNodeSplitOptions(problem);

        $scope.result = prefixPlots(result, $scope.taskUri);
        getTaskDetails($scope.taskUri); // refresh task to get script uri for sure
        if (problem.treatments && problem.treatments.length > 0) {
          $scope.selectedBaseline = problem.treatments[0];
        }
        var isLogScale = result.logScale;
        $scope.scaleName = AnalysisService.getScaleName($scope.model);
        $scope.diagnosticMap = DiagnosticsService.buildDiagnosticMap(
          $scope.model,
          $scope.problem,
          $scope.result
        );

        var unsorted = _.values($scope.diagnosticMap);
        $scope.diagnostics = unsorted.sort(DiagnosticsService.compareDiagnostics);


        if ($scope.model.modelType.type !== 'node-split') {
          var rankProbabilitiesByLevel = ModelService.addLevelandProcessData(result.rankProbabilities,
            problem.treatments, ModelService.nameRankProbabilities);
          var relativeEffectsTablesByLevel = ModelService.addLevelandProcessData(result.relativeEffects,
            problem.treatments, _.partialRight(RelativeEffectsTableService.buildTable, isLogScale));

          var rankProbabilities = ModelService.selectLevel($scope.model.regressor, $scope.problem, rankProbabilitiesByLevel,
            $scope.result.regressor);
          $scope.rankProbabilitiesByLevel = rankProbabilities.all;
          $scope.rankProbabilities = rankProbabilities.selected;

          var relativeEffectsTables = ModelService.selectLevel($scope.model.regressor, $scope.problem, relativeEffectsTablesByLevel,
            $scope.result.regressor);
          $scope.relativeEffectsTables = relativeEffectsTables.all;
          $scope.relativeEffectsTable = relativeEffectsTables.selected;

        } // end not nodesplit

        $scope.absoluteDevianceStatisticsTable = DevianceStatisticsService.buildAbsoluteTable(result.devianceStatistics, problem);
        $scope.relativeDevianceStatisticsTable = DevianceStatisticsService.buildRelativeTable(result.devianceStatistics);
        if ($scope.model.regressor) {
          $scope.controlTreatment = _.find($scope.problem.treatments, function(treatment) {
            return treatment.id === Number($scope.model.regressor.control);
          });
          $scope.covariateQuantiles = MetaRegressionService.getCovariateSummaries($scope.result, $scope.problem);
        }
        $scope.model = ModelResource.get($stateParams); // refresh so that model.taskUrl is set
        $scope.model.$promise.then(function(model) {
          modelDefer.resolve(model);
        });
        $scope.$emit('modelResultsAvailable', _.pick($stateParams, 'modelId', 'projectId'));
        resetScales();
        return result;
      });
    }

    function openBaselineDistributionModal() {
      $modal.open({
        templateUrl: gemtcRootPath + 'js/models/setBaselineDistribution.html',
        controller: 'SetBaselineDistributionController',
        windowClass: 'small',
        resolve: {
          outcomeWithAnalysis: function() {
            var outcome = _.cloneDeep($scope.analysis.outcome);
            var analysis = _.cloneDeep($scope.analysis);
            delete analysis.outcome;
            outcome.analysis = analysis;
            outcome.selectedModel = $scope.model;
            return outcome;
          },
          alternatives: function() {
            return $scope.problem.treatments;
          },
          interventionInclusions: function() {
            return $scope.analysis.interventionInclusions;
          },
          setBaselineDistribution: function() {
            return function(baseline) {
              $scope.baselineDistribution = baseline;
              ModelBaselineResource.set($stateParams, baseline);
              resetScales();
            };
          },
          problem: function() {
            if ($scope.model.sensitivity && $scope.model.sensitivity.omittedStudy) {
              return {
                entries: _.reject($scope.problem.entries, ['study', $scope.model.sensitivity.omittedStudy]),
                treatments: $scope.problem.treatments
              };
            } else {
              return $scope.problem;
            }
          }
        }
      });
    }

    function resetScales() {
      if (!$scope.baselineDistribution) {
        return;
      }
      var problem = ModelService.buildScalesProblem($scope.analysis, $scope.problem, $scope.baselineDistribution, $scope.result);
      $http.post('/patavi', problem)
        .then(function(result) {
          var uri = result.data.uri;
          if (result.status === 201 && uri) {
            return uri;
          }
        }, function(error) {
          $scope.$root.$broadcast('error', {
            type: 'BACK_END_ERROR',
            code: error.code || undefined,
            message: 'unable to submit the problem to the server'
          });
        })
        .then(function(uri) {
          return PataviService.listen(uri);
        })
        .then(
          function(result) {
            $scope.scales = result[$scope.analysis.outcome.name];
          },
          function(pataviError) {
            $scope.$root.$broadcast('error', {
              type: 'PATAVI',
              message: pataviError.desc
            });
          });
    }

    function goToModelData() {
      $window.open($scope.taskInfo._links.task.href, '_blank');
    }

    function goToRScript() {
      $window.open($scope.taskInfo._links.script.href, '_blank');
    }
  };
  return dependencies.concat(ModelController);
});