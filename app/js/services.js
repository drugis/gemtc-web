'use strict';

define(['./services/relativeEffectsTableService',
'./models/devianceStatisticsService',
'./models/modelService',
'./models/refineModelService',
'./models/result/resultsPlotService',
'./analyses/networkPlotService',
'./analyses/analysisService',
'./services/diagnosticsService',
'./models/nodeSplitOverviewService',
'./models/funnelPlot/funnelPlotService',
'./models/metaRegressionService', 'angular'], function(
  RelativeEffectsTableService,
  DevianceStatisticsService,
  ModelService,
  RefineModelService,
  ResultsPlotService,
  NetworkPlotService,
  AnalysisService,
  DiagnosticsService,
  NodeSplitOverviewService,
  FunnelPlotService,
  MetaRegressionService,
  angular) {
  return angular.module('gemtc.services', ['gemtc.resources'])
    .factory('RelativeEffectsTableService', RelativeEffectsTableService)
    .factory('DevianceStatisticsService', DevianceStatisticsService)
    .factory('ModelService', ModelService)
    .factory('RefineModelService', RefineModelService)
    .factory('ResultsPlotService', ResultsPlotService)
    .factory('NetworkPlotService', NetworkPlotService)
    .factory('AnalysisService', AnalysisService)
    .factory('DiagnosticsService', DiagnosticsService)
    .factory('NodeSplitOverviewService', NodeSplitOverviewService)
    .factory('FunnelPlotService', FunnelPlotService)
    .factory('MetaRegressionService', MetaRegressionService);
});
