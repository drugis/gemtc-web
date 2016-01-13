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
    .controller('RelativeEffectController', require('analyses/relativeEffectTableController'))

    // resources
    .factory('AnalysisResource', require('analyses/analysisResource'))
    .factory('ProblemResource', require('analyses/problemResource'))

    //services
    .factory('AnalysisService', require('analyses/analysisService'))
    .factory('NetworkPlotService', require('analyses/networkPlotService'))
    .factory('EvidenceTableService', require('analyses/evidenceTableService'))
    .factory('RelativeEffectTableService', require('analyses/relativeEffectTableService'))

    .directive('networkPlot', require('analyses/networkPlotDirective'))

    ;
});
