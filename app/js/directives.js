'use strict';
/* This file is used only by ADDIS */
define([
  './analyses/networkPlotDirective',
  './models/rankPlotDirective',
  './util/pagedSvgPlotDirective',
  './util/pagedPngPlotDirective',
  './models/runLength/runLengthDirective',
  './models/nodesplitForestPlot/nodesplitForestPlotDirective',
  './models/heterogeneityPrior/heterogeneityPriorDirective',
  './models/funnelPlot/funnelPlotDirective',
  './models/comparisonAdjustedFunnelPlot/comparisonAdjustedFunnelPlotDirective',
  './util/graphModalDirective/graphModalDirective',
  './models/result/relativeEffectPlotsDirective',
  './models/result/pairwiseForestPlotsDirective',
  './models/result/nodeSplitDensityPlotsDirective',
  './models/result/metaRegressionCovPlotsDirective',
  'angular'
], function(
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
  }
);
