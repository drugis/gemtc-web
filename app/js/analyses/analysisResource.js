'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var AnalysisResource = function($resource) {
    return $resource('/analyses/:analysisId', {
      analysisId: '@analysisId',
      modelId: '@modelId' // set query param
    }, {
      setPrimaryModel: {
        url: '/analyses/:analysisId/setPrimaryModel',
        method: 'POST',
      },
      setTitle: {
        url: '/analyses/:analysisId/setTitle',
        method: 'PUT'
      },
      setOutcome: {
        url: '/analyses/:analysisId/setOutcome',
        method: 'PUT'
      },
      setProblem: {
        url: '/analyses/:analysisId/setProblem',
        method: 'PUT'
      }
    });
  };
  return dependencies.concat(AnalysisResource);
});
