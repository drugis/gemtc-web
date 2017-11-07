'use strict';
var requires = [
  'gemtc-web/resources/modelResource',
  'gemtc-web/resources/modelBaselineResource',
  'gemtc-web/resources/funnelPlotResource',
  'gemtc-web/resources/problemResource',
  'gemtc-web/resources/pataviTaskIdResource'
];
define(requires.concat(['angular', 'angular-resource']), function(
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
    .factory('PataviTaskIdResource', PataviTaskIdResource);
});