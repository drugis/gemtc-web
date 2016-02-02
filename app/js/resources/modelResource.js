'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var ModelResource = function($resource) {
    return $resource('/projects/:projectId/analyses/:analysisId/models/:modelId', {
      projectId: '@projectId',
      analysisId: '@analysisId',
      modelId: '@id'
    }, {
      getResult: {
        url: '/projects/:projectId/analyses/:analysisId/models/:modelId/result',
        method: 'GET'
      }
    });
  };
  return dependencies.concat(ModelResource);
});
