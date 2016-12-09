'use strict';
define(function(require) {
  var angular = require('angular');

  return angular.module('gemtc.directives', [])
    .directive('networkPlot', require('gemtc-web/analyses/networkPlotDirective'))
    .directive('gemtcRankPlot', require('gemtc-web/models/rankPlotDirective'))
    .directive('pagedSvgPlot', require('gemtc-web/util/pagedSvgPlotDirective'))
    .directive('pagedPngPlot', require('gemtc-web/util/pagedPngPlotDirective'))
    .directive('appAlert', require('gemtc-web/util/appAlertDirective'))
    .directive('runLength', require('gemtc-web/models/runLength/runLengthDirective'))
    .directive('nodesplitForestPlot', require('gemtc-web/models/nodesplitForestPlot/nodesplitForestPlotDirective'))
    .directive('heterogeneityPrior', require('gemtc-web/models/heterogeneityPrior/heterogeneityPriorDirective'))
    .directive('funnelPlot', require('gemtc-web/models/funnelPlot/funnelPlotDirective'))
    .directive('comparisonAdjustedFunnelPlot', require('gemtc-web/models/comparisonAdjustedFunnelPlot/comparisonAdjustedFunnelPlotDirective'))
    .directive('graphModal', require('gemtc-web/util/graphModalDirective/graphModalDirective'))
    .directive('relativeEffectPlots', require('gemtc-web/models/result/relativeEffectPlotsDirective'))
    .directive('pairwiseForestPlots', require('gemtc-web/models/result/pairwiseForestPlotsDirective'))
    .directive('nodeSplitDensityPlots', require('gemtc-web/models/result/nodeSplitDensityPlotsDirective'))
    .directive('export', require('gemtc-web/util/exportDirective'))
    .directive('metaRegressionCovPlots', require('gemtc-web/models/result/metaRegressionCovPlotsDirective'));
});
