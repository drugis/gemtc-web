'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var EvidenceTableService = function() {

    function determineOutcomeType(studyList) {
      return studyList[0].arms[0].data.responders ? "dichotomous" : "continuous"
    }

    function studyMapToStudyArray(studyMap) {
      return _.map(studyMap, function(val, key) {
        return {
          title: key,
          arms: _.map(val.arms, function(val, key) {
            return {
              title: key,
              data: val
            }
          })
        };
      });
    }

    function studyListToEvidenceRows(studyList) {
      var tableRows = [];
      _.each(studyList, function(study) {
        _.each(study.arms, function(arm) {
          tableRows.push({
            studyTitle: study.title,
            studyRowSpan: study.arms.length,
            treatmentTitle: arm.title,
            evidence: cleanUpEvidencePropertyNames(arm.data),
            showStudyColumn: (study.arms[0].title === arm.title)
          });
        })
      });
      return tableRows;
    }

    function cleanUpEvidencePropertyNames(armData) {
      var evidence = {}
      if(armData.hasOwnProperty('responders')) {
        evidence.responders = armData.responders;
      }
      if(armData.hasOwnProperty('sampleSize')) {
        evidence.sampleSize = armData.sampleSize;
      }
      if(armData.hasOwnProperty('mean')) {
        evidence.mean = armData.mean
      }
      if(armData.hasOwnProperty('std.dev')) {
        evidence.stdDev = armData['std.dev']
      }
      return evidence;
    }


    return {
      determineOutcomeType: determineOutcomeType,
      studyMapToStudyArray: studyMapToStudyArray,
      studyListToEvidenceRows: studyListToEvidenceRows,
    };

  };

  return dependencies.concat(EvidenceTableService);
});