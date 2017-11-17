'use strict';
var requires = [
  'analyses/analysesController',
  'analyses/analysisController',
  'analyses/addAnalysisController',
  'analyses/networkGraphController',
  'analyses/evidenceTableController',
  'analyses/relativeEffectTableController',
  'analyses/analysisResource',
  'analyses/problemResource',
  'analyses/analysisService',
  'analyses/networkPlotService',
  'analyses/evidenceTableService',
  'analyses/networkPlotDirective'
];
define(requires.concat(['angular', 'angular-resource']), function(
  AnalysesController,
  AnalysisController,
  AddAnalysisController,
  NetworkGraphController,
  EvidenceTableController,
  RelativeEffectTableController,
  AnalysisResource,
  ProblemResource,
  AnalysisService,
  NetworkPlotService,
  EvidenceTableService,
  networkPlot,
  angular
) {
  var dependencies = ['ngResource', 'gemtc.models'];
  return angular.module('gemtc.analyses', dependencies)
    // controllers
    .controller('AnalysesController', AnalysesController)
    .controller('AnalysisController', AnalysisController)
    .controller('AddAnalysisController', AddAnalysisController)
    .controller('NetworkGraphController', NetworkGraphController)
    .controller('EvidenceTableController', EvidenceTableController)
    .controller('RelativeEffectTableController', RelativeEffectTableController)

    // resources
    .factory('AnalysisResource', AnalysisResource)
    .factory('ProblemResource', ProblemResource)

    //services
    .factory('AnalysisService', AnalysisService)
    .factory('NetworkPlotService', NetworkPlotService)
    .factory('EvidenceTableService', EvidenceTableService)

    .directive('networkPlot', networkPlot)
  ;
});