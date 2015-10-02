'use strict';
define(['angular', 'angular-resource'], function(angular, angularResource) {
  var dependencies = ['$resource'];
  var StandaloneModelResource = function($resource) {
    return $resource('/analyses/:analysisId/models/:modelId', null, {
      extendRunLength: {
        method: 'post',
        url: '/projects/:projectId/analyses/:analysisId/models/:modelId/extendRunLength'
      }
    });
  };
  return dependencies.concat(StandaloneModelResource);
});
