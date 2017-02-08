'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var StandaloneModelResource = function($resource) {
    return $resource('/analyses/:analysisId/models/:modelId', null, {
      getResult: {
        url: '/analyses/:analysisId/models/:modelId/result',
        method: 'GET'
      },
      setAttributes: {
        url: '/projects/:projectId/analyses/:analysisId/models/:modelId/attributes',
        method: 'POST'
      }
    });
  };
  return dependencies.concat(StandaloneModelResource);
});
