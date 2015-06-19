'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource', 'gemtc.models'];

  return angular.module('gemtc.analyses', dependencies)
    // controllers
    .controller('AnalysesController', require('analyses/analysesController'))
    .controller('AnalysisController', require('analyses/analysisController'))
    .controller('AddAnalysisController', require('analyses/addAnalysisController'))

    // resources
    .factory('AnalysisResource', require('analyses/analysisResource'))

    .directive('networkPlot', require('analyses/networkPlotDirective'))
    ;
});
