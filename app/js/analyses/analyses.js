'use strict';
define([
  './analysesController',
  './analysisController',
  './addAnalysisController',
  './networkGraphController',
  './evidenceTableController',
  './relativeEvidenceTableController',
  './editAnalysisTitleController',
  './analysisResource',
  './problemResource',
  './analysisService',
  './networkPlotService',
  './evidenceTableService',
  './networkPlotDirective', 'angular', 'angular-resource'
], function(
  AnalysesController,
  AnalysisController,
  AddAnalysisController,
  NetworkGraphController,
  EvidenceTableController,
  RelativeEvidenceTableController,
  EditAnalysisTitleController,
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
      .controller('RelativeEvidenceTableController', RelativeEvidenceTableController)
      .controller('EditAnalysisTitleController', EditAnalysisTitleController)

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
