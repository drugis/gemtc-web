'use strict';

define(function(require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.models', dependencies)
    // controllers
    .controller('ModelsController', require('models/modelsController'))
    .controller('CreateModelController', require('models/createModelController'))
    .controller('ExtendRunLengthController', require('models/extendRunLengthController'))
    .controller('NodeSplitOverviewController', require('models/nodeSplitOverviewController'))
    .controller('CreateNodeSplitModelController', require('models/createNodeSplitModelController'))
    .controller('CreateNetworkModelController', require('models/createNetworkModelController'))
    .controller('AddComparisonFunnelPlotController', require('models/addComparisonFunnelPlotController'))
    .controller('SetBaselineDistributionController', require('models/setBaselineDistributionController'))

  // resources
    .factory('ModelResource', require('models/standaloneModelResource'))
    .factory('ModelBaselineResource', require('models/standaloneModelBaselineResource'))
    .factory('ProblemResource', require('models/standaloneProblemResource'))
    .factory('AnalysisResource', require('analyses/analysisResource'))
    .factory('FunnelPlotResource', require('models/funnelPlotResource'))

  //services
    .factory('ModelService', require('models/modelService'))
    .factory('RefineModelService', require('models/refineModelService'))
    .factory('AnalysisService', require('analyses/analysisService'))
    .factory('DevianceStatisticsService', require('models/devianceStatisticsService'))
    .factory('NodeSplitOverviewService', require('models/nodeSplitOverviewService'))
    .factory('MetaRegressionService', require('gemtc-web/models/metaRegressionService'))
    .factory('ResultsPlotService', require('gemtc-web/models/result/resultsPlotService'))

  //directives
    .directive('gemtcRankPlot', require('models/rankPlotDirective'))
    .directive('runLength', require('models/runLength/runLengthDirective'))
    .directive('nodesplitForestPlot', require('models/nodesplitForestPlot/nodesplitForestPlotDirective'))
    .directive('heterogeneityPrior', require('models/heterogeneityPrior/heterogeneityPriorDirective'))
    .directive('relativeEffectPlots', require('models/result/relativeEffectPlotsDirective'))
    .directive('pairwiseForestPlots', require('models/result/pairwiseForestPlotsDirective'))
    .directive('nodeSplitDensityPlots', require('models/result/nodeSplitDensityPlotsDirective'))
    .directive('funnelPlot', require('models/funnelPlot/funnelPlotDirective'))
    .directive('comparisonAdjustedFunnelPlot', require('models/comparisonAdjustedFunnelPlot/comparisonAdjustedFunnelPlotDirective'))
    .directive('metaRegressionCovPlots', require('models/result/metaRegressionCovPlotsDirective'))

    //filters
    .filter('distributionToStringFilter', require('models/distributionToStringFilter'))
    ;
});
