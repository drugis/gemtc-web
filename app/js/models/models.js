'use strict';

define(function (require) {
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

    // resources
    .factory('ModelResource', require('models/standaloneModelResource'))
    .factory('ProblemResource', require('models/standaloneProblemResource'))
    .factory('AnalysisResource', require('analyses/analysisResource'))

    //services
    .factory('ModelService', require('models/modelService'))
    .factory('AnalysisService', require('analyses/analysisService'))
    .factory('DevianceStatisticsService', require('models/devianceStatisticsService'))
    .factory('NodeSplitOverviewService', require('models/nodeSplitOverviewService'))
    .factory('MetaRegressionService', require('gemtc-web/models/metaRegressionService'))

    //directives
    .directive('gemtcRankPlot',require('models/rankPlotDirective'))
    .directive('runLength',require('models/runLength/runLengthDirective'))
    .directive('nodesplitForestPlot',require('models/nodesplitForestPlot/nodesplitForestPlotDirective'))
    .directive('heterogeneityPrior', require('models/heterogeneityPrior/heterogeneityPriorDirective'))
    .directive('relativeEffectPlots', require('models/result/relativeEffectPlotsDirective'))
    .directive('pairwiseForestPlots', require('models/result/pairwiseForestPlotsDirective'))
    .directive('nodeSplitDensityPlots', require('models/result/nodeSplitDensityPlotsDirective'))
    .directive('metaRegressionCovPlots', require('models/result/metaRegressionCovPlotsDirective'))
    ;
});
