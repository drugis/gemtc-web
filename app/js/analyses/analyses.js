'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource', 'gemtc.models'];

  return angular.module('gemtc.analyses', dependencies)
    // controllers
    .controller('AnalysesController', require('analyses/analysesController'))
    .controller('AnalysisController', require('analyses/analysisController'))
    .controller('AddAnalysisController', require('analyses/addAnalysisController'))
    .controller('NetworkGraphController', require('analyses/networkGraphController'))
    .controller('EvidenceTableController', require('analyses/evidenceTableController'))

    // resources
    .factory('AnalysisResource', require('analyses/analysisResource'))

    //services
    .factory('AnalysisService', require('analyses/analysisService'))    
    .factory('NetworkPlotService', require('analyses/networkPlotService'))
    .factory('EvidenceTableService', require('analyses/evidenceTableService'))

    .directive('networkPlot', require('analyses/networkPlotDirective'))

    ;
});
