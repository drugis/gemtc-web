'use strict';
define([
  'gemtc-web/models/modelsController',
  'gemtc-web/models/createModelController',
  'gemtc-web/models/extendRunLengthController',
  'gemtc-web/models/nodeSplitOverviewController',
  'gemtc-web/models/createNodeSplitModelController',
  'gemtc-web/models/createNetworkModelController',
  'gemtc-web/models/addComparisonFunnelPlotController',
  'gemtc-web/models/setBaselineDistributionController',
  'gemtc-web/models/standaloneModelResource',
  'gemtc-web/models/standaloneModelBaselineResource',
  'gemtc-web/models/standaloneProblemResource',
  'gemtc-web/analyses/analysisResource',
  'gemtc-web/models/funnelPlotResource',
  'gemtc-web/models/modelService',
  'gemtc-web/models/refineModelService',
  'gemtc-web/analyses/analysisService',
  'gemtc-web/models/devianceStatisticsService',
  'gemtc-web/models/nodeSplitOverviewService',
  'gemtc-web/models/metaRegressionService',
  'gemtc-web/models/result/resultsPlotService',
  'gemtc-web/models/rankPlotDirective',
  'gemtc-web/models/runLength/runLengthDirective',
  'gemtc-web/models/nodesplitForestPlot/nodesplitForestPlotDirective',
  'gemtc-web/models/heterogeneityPrior/heterogeneityPriorDirective',
  'gemtc-web/models/result/relativeEffectPlotsDirective',
  'gemtc-web/models/result/pairwiseForestPlotsDirective',
  'gemtc-web/models/result/nodeSplitDensityPlotsDirective',
  'gemtc-web/models/funnelPlot/funnelPlotService',
  'gemtc-web/models/funnelPlot/funnelPlotDirective',
  'gemtc-web/models/comparisonAdjustedFunnelPlot/comparisonAdjustedFunnelPlotDirective',
  'gemtc-web/models/result/metaRegressionCovPlotsDirective',
  'gemtc-web/models/distributionToStringFilter', 'angular', 'angular-resource'], function(
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