'use strict';
var requires = [
  'gemtc-web/analyses/networkPlotDirective',
  'gemtc-web/models/rankPlotDirective',
  'gemtc-web/util/pagedSvgPlotDirective',
  'gemtc-web/util/pagedPngPlotDirective',
  'gemtc-web/models/runLength/runLengthDirective',
  'gemtc-web/models/nodesplitForestPlot/nodesplitForestPlotDirective',
  'gemtc-web/models/heterogeneityPrior/heterogeneityPriorDirective',
  'gemtc-web/models/funnelPlot/funnelPlotDirective',
  'gemtc-web/models/comparisonAdjustedFunnelPlot/comparisonAdjustedFunnelPlotDirective',
  'gemtc-web/util/graphModalDirective/graphModalDirective',
  'gemtc-web/models/result/relativeEffectPlotsDirective',
  'gemtc-web/models/result/pairwiseForestPlotsDirective',
  'gemtc-web/models/result/nodeSplitDensityPlotsDirective',
  'gemtc-web/models/result/metaRegressionCovPlotsDirective'
];
define(requires.concat(['angular']), function(
  networkPlot,
  gemtcRankPlot,
  pagedSvgPlot,
  pagedPngPlot,
  runLength,
  nodesplitForestPlot,
  heterogeneityPrior,
  funnelPlot,
  comparisonAdjustedFunnelPlot,
  graphModal,
  relativeEffectPlots,
  pairwiseForestPlots,
  nodeSplitDensityPlots,
  metaRegressionCovPlots,
  angular
) {

  return angular.module('gemtc.directives', [])
    .directive('networkPlot', networkPlot)
    .directive('gemtcRankPlot', gemtcRankPlot)
    .directive('pagedSvgPlot', pagedSvgPlot)
    .directive('pagedPngPlot', pagedPngPlot)
    .directive('runLength', runLength)
    .directive('nodesplitForestPlot', nodesplitForestPlot)
    .directive('heterogeneityPrior', heterogeneityPrior)
    .directive('funnelPlot', funnelPlot)
    .directive('comparisonAdjustedFunnelPlot', comparisonAdjustedFunnelPlot)
    .directive('graphModal', graphModal)
    .directive('relativeEffectPlots', relativeEffectPlots)
    .directive('pairwiseForestPlots', pairwiseForestPlots)
    .directive('nodeSplitDensityPlots', nodeSplitDensityPlots)
    .directive('metaRegressionCovPlots', metaRegressionCovPlots);
});