'use strict';
define(['angular', 'angular-resource'], function(angular, angularResource) {
  var dependencies = ['$resource'];
  var StandaloneModelResource = function($resource) {
    return $resource('/analyses/:analysisId/models/:modelId', null, {
      getResult: {
        url: '/analyses/:analysisId/models/:modelId/result',
        method: 'GET'
      }
    });
  };
  return dependencies.concat(StandaloneModelResource);
});
