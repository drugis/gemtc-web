'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var DevianceStatisticsService = function() {
    function buildAbsoluteTable(devianceStatistics, problem) {
      var table = [],
        treatmentMap = _.keyBy(problem.treatments, 'id'),
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

    function buildRelativeTable(devianceStatistics) {
      return _.map(devianceStatistics.relativeDeviance, function(value, key) {
        return {
          studyName: key,
          deviance: value,
          leverage: devianceStatistics.relativeLeverage[key]
        };
      });
    }

    return {
      buildAbsoluteTable: buildAbsoluteTable,
      buildRelativeTable: buildRelativeTable
    };
  };

  return dependencies.concat(DevianceStatisticsService);
});
