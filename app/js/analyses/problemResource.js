'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var ProblemResource = function($resource) {
    return $resource('/analyses/:analysisId/problem');
  };
  return dependencies.concat(ProblemResource)
});
