'use strict';

define([
  './resources/modelResource',
  './resources/modelBaselineResource',
  './resources/funnelPlotResource',
  './resources/problemResource',
  './resources/pataviTaskIdResource', 'angular', 'angular-resource'], function(
    ModelResource,
    ModelBaselineResource,
    FunnelPlotResource,
    ProblemResource,
    PataviTaskIdResource,
    angular) {
    return angular.module('gemtc.resources', ['ngResource'])
      .factory('ModelResource', ModelResource)
      .factory('ModelBaselineResource', ModelBaselineResource)
      .factory('FunnelPlotResource', FunnelPlotResource)
      .factory('ProblemResource', ProblemResource)
      .factory('PataviTaskIdResource', PataviTaskIdResource)
      ;
  });
