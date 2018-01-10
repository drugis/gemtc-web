'use strict';
var requires = [
  'models/modelsController',
  'models/createModelController',
  'models/extendRunLengthController',
  'models/nodeSplitOverviewController',
  'models/createNodeSplitModelController',
  'models/createNetworkModelController',
  'models/addComparisonFunnelPlotController',
  'models/setBaselineDistributionController',
  'models/standaloneModelResource',
  'models/standaloneModelBaselineResource',
  'models/standaloneProblemResource',
  'analyses/analysisResource',
  'models/funnelPlotResource',
  'models/modelService',
  'models/refineModelService',
  'analyses/analysisService',
  'models/devianceStatisticsService',
  'models/nodeSplitOverviewService',
  'gemtc-web/models/metaRegressionService',
  'gemtc-web/models/result/resultsPlotService',
  'models/rankPlotDirective',
  'models/runLength/runLengthDirective',
  'models/nodesplitForestPlot/nodesplitForestPlotDirective',
  'models/heterogeneityPrior/heterogeneityPriorDirective',
  'models/result/relativeEffectPlotsDirective',
  'models/result/pairwiseForestPlotsDirective',
  'models/result/nodeSplitDensityPlotsDirective',
  'models/funnelPlot/funnelPlotService',
  'models/funnelPlot/funnelPlotDirective',
  'models/comparisonAdjustedFunnelPlot/comparisonAdjustedFunnelPlotDirective',
  'models/result/metaRegressionCovPlotsDirective',
  'models/distributionToStringFilter'
];
define(requires.concat(['angular', 'angular-resource']), function(
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