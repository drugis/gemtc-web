'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var StandaloneModelBaselineResource = function($resource) {
    return $resource('/analyses/:analysisId/models/:modelId/baseline', null, {
      'put': {
        method: 'PUT'
      }
    });
  };
  return dependencies.concat(StandaloneModelBaselineResource);
});
