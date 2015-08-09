'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.models', dependencies)
  	// controllers
  	.controller('ModelsController', require('models/modelsController'))
    .controller('StandAloneModelContainerController', require('models/standAloneModelContainerController'))
    .controller('CreateModelController', require('models/createModelController'))

    // resources
    .factory('ModelResource', require('models/standaloneModelResource'))
    .factory('ProblemResource', require('models/standaloneProblemResource'))
    .factory('AnalysisResource', require('analyses/analysisResource'))

    //services
    .factory('ModelService', require('models/modelService'))
    .factory('AnalysisService', require('analyses/analysisService'))

    .directive('gemtcRankPlot',require('models/rankPlotDirective'))
    ;
});
