'use strict';
define(function(require) {
  var angular = require('angular');
  return angular.module('gemtc.services', [])
    .factory('PataviService', require('gemtc-web/services/pataviService'))
    .factory('RelativeEffectsTableService', require('gemtc-web/services/relativeEffectsTableService'))
    .factory('NetworkPlotService', require('gemtc-web/analyses/networkPlotService'))
    .factory('AnalysisService', require('gemtc-web/analyses/analysisService'))
    .factory('DiagnosticsService', require('gemtc-web/services/diagnosticsService'))
    .factory('ModelService', require('gemtc-web/models/modelService'))
    ;
});
