'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var ModelResource = function($resource) {
    return $resource('/projects/:projectId/analyses/:analysisId/models/:modelId', {
      projectId: '@projectId',
      analysisId: '@analysisId',
      modelId: '@id'
    }, {
      getConsistencyModels: {
        url: '/projects/:projectId/consistencyModels',
        method: 'GET',
        isArray: true
      },
      queryByProject: {
        url: '/projects/:projectId/models',
        method: 'GET',
        isArray: true
      },
      getResult: {
        url: '/projects/:projectId/analyses/:analysisId/models/:modelId/result',
        method: 'GET'
      },
      setAttributes: {
        url: '/projects/:projectId/analyses/:analysisId/models/:modelId/attributes',
        method: 'POST'
      },
      setTitle: {
        url:'/projects/:projectId/analyses/:analysisId/models/:modelId/setTitle',
        method: 'PUT'
      }
    });
  };
  return dependencies.concat(ModelResource);
});
