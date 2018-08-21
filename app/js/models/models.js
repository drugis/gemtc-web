'use strict';
define([
  './modelsController',
  './createModelController',
  './extendRunLengthController',
  './nodeSplitOverviewController',
  './createNodeSplitModelController',
  './createNetworkModelController',
  './addComparisonFunnelPlotController',
  './setBaselineDistributionController',
  './standaloneModelResource',
  './standaloneModelBaselineResource',
  './standaloneProblemResource',
  'gemtc-web/analyses/analysisResource',
  './funnelPlotResource',
  './modelService',
  './refineModelService',
  'gemtc-web/analyses/analysisService',
  './devianceStatisticsService',
  './nodeSplitOverviewService',
  './metaRegressionService',
  './result/resultsPlotService',
  './rankPlotDirective',
  './runLength/runLengthDirective',
  './nodesplitForestPlot/nodesplitForestPlotDirective',
  './heterogeneityPrior/heterogeneityPriorDirective',
  './result/relativeEffectPlotsDirective',
  './result/pairwiseForestPlotsDirective',
  './result/nodeSplitDensityPlotsDirective',
  './funnelPlot/funnelPlotService',
  './funnelPlot/funnelPlotDirective',
  './comparisonAdjustedFunnelPlot/comparisonAdjustedFunnelPlotDirective',
  './result/metaRegressionCovPlotsDirective',
  './distributionToStringFilter', 'angular', 'angular-resource'], function(
  ModelsController,
  CreateModelController,
  ExtendRunLengthController,
  NodeSplitOverviewController,
  CreateNodeSplitModelController,
  CreateNetworkModelController,
  AddComparisonFunnelPlotController,
  SetBaselineDistributionController,
  ModelResource,
  ModelBaselineResource,
  ProblemResource,
  AnalysisResource,
  FunnelPlotResource,
  ModelService,
  RefineModelService,
  AnalysisService,
  DevianceStatisticsService,
  NodeSplitOverviewService,
  MetaRegressionService,
  ResultsPlotService,
  gemtcRankPlot,
  runLength,
  nodesplitForestPlot,
  heterogeneityPrior,
  relativeEffectPlots,
  pairwiseForestPlots,
  nodeSplitDensityPlots,
  FunnelPlotService,
  funnelPlot,
  comparisonAdjustedFunnelPlot,
  metaRegressionCovPlots,
  distributionToStringFilter,
  angular
) {
  var dependencies = ['ngResource'];
  return angular.module('gemtc.models', dependencies)
    // controllers
    .controller('ModelsController', ModelsController)
    .controller('CreateModelController', CreateModelController)
    .controller('ExtendRunLengthController', ExtendRunLengthController)
    .controller('NodeSplitOverviewController', NodeSplitOverviewController)
    .controller('CreateNodeSplitModelController', CreateNodeSplitModelController)
    .controller('CreateNetworkModelController', CreateNetworkModelController)
    .controller('AddComparisonFunnelPlotController', AddComparisonFunnelPlotController)
    .controller('SetBaselineDistributionController', SetBaselineDistributionController)

    // resources
    .factory('ModelResource', ModelResource)
    .factory('ModelBaselineResource', ModelBaselineResource)
    .factory('ProblemResource', ProblemResource)
    .factory('AnalysisResource', AnalysisResource)
    .factory('FunnelPlotResource', FunnelPlotResource)

    //services
    .factory('ModelService', ModelService)
    .factory('RefineModelService', RefineModelService)
    .factory('AnalysisService', AnalysisService)
    .factory('DevianceStatisticsService', DevianceStatisticsService)
    .factory('NodeSplitOverviewService', NodeSplitOverviewService)
    .factory('MetaRegressionService', MetaRegressionService)
    .factory('ResultsPlotService', ResultsPlotService)
    .factory('FunnelPlotService', FunnelPlotService)

    //directives
    .directive('gemtcRankPlot', gemtcRankPlot)
    .directive('runLength', runLength)
    .directive('nodesplitForestPlot', nodesplitForestPlot)
    .directive('heterogeneityPrior', heterogeneityPrior)
    .directive('relativeEffectPlots', relativeEffectPlots)
    .directive('pairwiseForestPlots', pairwiseForestPlots)
    .directive('nodeSplitDensityPlots', nodeSplitDensityPlots)
    .directive('funnelPlot', funnelPlot)
    .directive('comparisonAdjustedFunnelPlot', comparisonAdjustedFunnelPlot)
    .directive('metaRegressionCovPlots', metaRegressionCovPlots)

    //filters
    .filter('distributionToStringFilter', distributionToStringFilter);
});
