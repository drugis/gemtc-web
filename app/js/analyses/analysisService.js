'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var AnalysisService = function() {

    function problemToStudyMap(problemArg) {
      var problem = angular.copy(problemArg);
      var treatmentsMap = _.indexBy(problem.treatments, 'id');
      return _.reduce(problem.entries, function(studies, entry) {
        if (!studies[entry.study]) {
          studies[entry.study] = {
            arms: {}
          };
        }
        entry.treatment = treatmentsMap[entry.treatment];
        studies[entry.study].arms[entry.treatment.name] = _.omit(entry, 'study', 'treatment');

        return studies;
      }, {});
    }


    return {
      problemToStudyMap: problemToStudyMap
    };

  };

  return dependencies.concat(AnalysisService);
});