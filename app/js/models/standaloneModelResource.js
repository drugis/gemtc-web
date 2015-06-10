'use strict';
define(['angular', 'angular-resource'], function(angular, angularResource) {
  var dependencies = ['$resource'];
  var StandaloneModelResource = function($resource) {
    return $resource('/analyses/:analysisId/models/:modelId');
  };
  return dependencies.concat(StandaloneModelResource);
});
