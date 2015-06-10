'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var ProblemResource = function($resource) {
    return $resource('/analyses/:analysisId/problem', {
      analysisId: '@analysisId'
    });
  };
  return dependencies.concat(ProblemResource);
});
