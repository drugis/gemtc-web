define([], function() {
  var dependencies = ['$resource'];
  var AnalysesResource = function($resource) {
    return $resource('/analyses/:analysisId');
  };
  return dependencies.concat(AnalysesResource)
});
