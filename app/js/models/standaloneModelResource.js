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
        url: '/analyses/:analysisId/models/:modelId/attributes',
        method: 'POST'
      },
      setTitle: {
        url: '/analyses/:analysisId/models/:modelId/setTitle',
        method: 'PUT'
      },
      setSensitivity: {
        url:'/analyses/:analysisId/models/:modelId/setSensitivity',
        method: 'PUT'
      }
    });
  };
  return dependencies.concat(StandaloneModelResource);
});
