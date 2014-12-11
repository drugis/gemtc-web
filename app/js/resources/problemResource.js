'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var ProblemResource = function($resource) {
    return $resource('/projects/:projectId/analyses/:analysisId/problem', {
      projectId: '@projectId',
      analysisId: '@analysisId'
    });
  };
  return dependencies.concat(ProblemResource);
});