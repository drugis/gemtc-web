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

    // resources
    .factory('AnalysisResource', require('analyses/analysisResource'))

    //services
    .factory('NetworkPlotService', require('analyses/networkPlotService'))

    .directive('networkPlot', require('analyses/networkPlotDirective'))

    ;
});
