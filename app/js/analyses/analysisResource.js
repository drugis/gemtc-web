define([], function() {
  var dependencies = ['$resource'];
  var AnalysisResource = function($resource) {
    return $resource('/analyses/:analysisId');
  };
  return dependencies.concat(AnalysisResource)
});
