'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var StandaloneModelAttributeResource = function($resource) {
    return $resource('/analyses/:analysisId/models/:modelId/attributes');
  };
  return dependencies.concat(StandaloneModelAttributeResource);
});
