'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var DevianceStatisticsService = function() {
    function buildTable(devianceStatistics, problem) {
      var table = [],
        treatmentMap = _.indexBy(problem.treatments, 'id'),
        studyMap = _.transform(problem.entries, function(result, entry) {
          var studyName = entry.study;
          result[studyName] = result[studyName] ? result[studyName].concat(entry) : [entry];
          return result;
        });


      _.each(devianceStatistics.perArmDeviance, function(deviance, study) {
        var firstStudyRow = true;
        _.each(deviance, function(devianceEntry, treatmentId) {
          var row = {
            studyName: study,
            armName: treatmentMap[treatmentId].name,
            deviance: devianceEntry,
            leverage: devianceStatistics.perArmLeverage[study][treatmentId]
          };
          if(firstStudyRow) {
             row.rowSpan =   Object.keys(deviance).length;
          }
          table.push(row);
          firstStudyRow = false;
        });
      });

      return table;
    }
    return {
      buildTable: buildTable
    };
  };

  return dependencies.concat(DevianceStatisticsService);
});
