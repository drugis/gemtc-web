define(function(require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.directives', [])

  .directive('networkPlot', require('gemtc-web/analyses/networkPlotDirective'))
  .directive('gemtcRankPlot', require('gemtc-web/models/rankPlotDirective'))
  .directive('pagedSvgPlot', require('gemtc-web/utils/pagedSvgDirective'))
  ;
});
