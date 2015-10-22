define(function(require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.directives', [])
    .directive('networkPlot', require('gemtc-web/analyses/networkPlotDirective'))
    .directive('gemtcRankPlot', require('gemtc-web/models/rankPlotDirective'))
    .directive('pagedSvgPlot', require('gemtc-web/util/pagedSvgPlotDirective'))
    .directive('pagedPngPlot', require('gemtc-web/util/pagedPngPlotDirective'))
    .directive('appAlert', require('gemtc-web/util/appAlertDirective'))
    .directive('runLength', require('gemtc-web/models/runLength/runLengthDirective'))
    .directive('nodesplitForestPlot',require('gemtc-web/models/nodesplitForestPlot/nodesplitForestPlotDirective'))
    .directive('heterogeneityPrior', require('gemtc-web/models/heterogeneityPrior/heterogeneityPriorDirective'))
  ;
});
