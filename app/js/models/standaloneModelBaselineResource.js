'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var StandaloneModelBaselineResource = function($resource) {
    return $resource('/analyses/:analysisId/models/:modelId/baseline', null, {
      'set': {
        method: 'PUT'
      }
    });
  };
  return dependencies.concat(StandaloneModelBaselineResource);
});
