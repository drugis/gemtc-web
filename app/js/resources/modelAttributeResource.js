'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var ModelAttributeResource = function($resource) {
    return $resource('/projects/:projectId/analyses/:analysisId/models/:modelId/attributes');
  };
  return dependencies.concat(ModelAttributeResource);
});
