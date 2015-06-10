'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var PataviTaskIdResource = function($resource) {
    return $resource('/analyses/:analysisId/models/:modelId/task');
  };
  return dependencies.concat(PataviTaskIdResource);
});
