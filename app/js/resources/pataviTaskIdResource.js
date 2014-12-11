'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var PataviTaskIdResource = function($resource) {
    return $resource('/projects/:projectId/analyses/:analysisId/models/:modelId/task', {
      projectId: '@projectId',
      analysisId: '@analysisId',
      modelId: '@modelId'
    });
  };
  return dependencies.concat(PataviTaskIdResource);
});