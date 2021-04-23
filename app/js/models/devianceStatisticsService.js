'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var DevianceStatisticsService = function() {
    function buildAbsoluteTable(devianceStatistics, problem) {
      var table = [];
      var treatmentMap = _.keyBy(problem.treatments, 'id');

      _.forEach(devianceStatistics.perArmDeviance, function(deviance, study) {
        var firstStudyRow = true;
        _.forEach(deviance, function(devianceEntry, treatmentId) {
          var row = {
            studyName: study,
            armName: treatmentMap[treatmentId].name,
            deviance: devianceEntry,
            leverage: devianceStatistics.perArmLeverage[study][treatmentId]
          };
          if (firstStudyRow) {
            row.rowSpan = _.size(deviance);
          }
          table.push(row);
          firstStudyRow = false;
        });
      });

      return table;
    }

    function buildRelativeTable(devianceStatistics, problem) {
      return _.map(devianceStatistics.relativeDeviance, function(value, id) {
        return {
          studyName: getStudyName(id, problem),
          deviance: value,
          leverage: devianceStatistics.relativeLeverage[id]
        };
      });
    }

    function getStudyName(id, problem) {
      if (problem.relativeEffectData.data[id] &&
        problem.relativeEffectData.data[id].otherArms &&
        problem.relativeEffectData.data[id].otherArms[0] &&
        problem.relativeEffectData.data[id].otherArms[0].study
      ) {
        return problem.relativeEffectData.data[id].otherArms[0].study;
      } else {
        return id;
      }
    }
    
    return {
      buildAbsoluteTable: buildAbsoluteTable,
      buildRelativeTable: buildRelativeTable
    };
  };

  return dependencies.concat(DevianceStatisticsService);
});
