'use strict';
var requires = [
  'gemtc-web/services/relativeEffectsTableService',
  'gemtc-web/models/devianceStatisticsService',
  'gemtc-web/models/modelService',
  'gemtc-web/models/refineModelService',
  'gemtc-web/models/result/resultsPlotService',
  'gemtc-web/analyses/networkPlotService',
  'gemtc-web/analyses/analysisService',
  'gemtc-web/services/diagnosticsService',
  'gemtc-web/models/nodeSplitOverviewService',
  'gemtc-web/models/metaRegressionService'
];
define(requires.concat(['angular']), function(
  RelativeEffectsTableService,
  DevianceStatisticsService,
  ModelService,
  RefineModelService,
  ResultsPlotService,
  NetworkPlotService,
  AnalysisService,
  DiagnosticsService,
  NodeSplitOverviewService,
  MetaRegressionService,
  angular) {
  return angular.module('gemtc.services', [])
    .factory('RelativeEffectsTableService', RelativeEffectsTableService)
    .factory('DevianceStatisticsService', DevianceStatisticsService)
    .factory('ModelService', ModelService)
    .factory('RefineModelService', RefineModelService)
    .factory('ResultsPlotService', ResultsPlotService)

    .factory('NetworkPlotService', NetworkPlotService)
    .factory('AnalysisService', AnalysisService)
    .factory('DiagnosticsService', DiagnosticsService)
    .factory('NodeSplitOverviewService', NodeSplitOverviewService)
    .factory('MetaRegressionService', MetaRegressionService);
});