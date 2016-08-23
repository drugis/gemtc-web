'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var FunnelPlotResource = function($resource) {
    return $resource('/projects/:projectId/analyses/:analysisId/models/:modelId/funnelPlots/:funnelPlotId');
  };
  return dependencies.concat(FunnelPlotResource);
});
