'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var ModelBaselineResource = function($resource) {
    return $resource('/projects/:projectId/analyses/:analysisId/models/:modelId/baseline', {
      projectId: '@projectId',
      analysisId: '@analysisId',
      modelId: '@id'
    }, {
      'set': {
        method: 'PUT'
      }
    });
  };
  return dependencies.concat(ModelBaselineResource);
});
