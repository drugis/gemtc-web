'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var EvidenceTableService = function() {

    function determineOutcomeType(studyList) {
      return studyList[0].arms[0].data.responders ? "dichotomous" : "continuous";
    }

    function studyMapToStudyArray(studyMap) {
      return _.map(studyMap, function(val, key) {
        return {
          title: key,
          arms: _.map(val.arms, function(val, key) {
            return {
              title: key,
              data: val
            };
          })
        };
      });
    }

    function formatCovariate(data) {
      return data === null ? 'NA' : data;
    }

    function buildCovariatesColumns(studyCovariates) {
      return _.map(studyCovariates, function(data, headerTitle) {
        return {
          data: formatCovariate(data),
          headerTitle: headerTitle
        };
      });
    }

    function isAbsoluteEffectStudy(study) {
      return !!_.find(study.arms, function(arm) {
        return arm.data.hasOwnProperty('sampleSize') ||
          arm.data.hasOwnProperty('responders') ||
          arm.data.hasOwnProperty('mean') ||
          arm.data.hasOwnProperty('stdDev');
      });
    }

    function studyListToEvidenceRows(studyList, studyLevelCovariates) {
      var tableRows = [];
      var filteredStudies = studyList.filter(isAbsoluteEffectStudy);
      _.forEach(filteredStudies, function(study) {
        _.forEach(study.arms, function(arm) {
          var tableRow = {
            studyTitle: study.title,
            studyRowSpan: study.arms.length,
            treatmentTitle: arm.title,
            evidence: cleanUpEvidencePropertyNames(arm.data),
            showStudyColumn: (study.arms[0].title === arm.title)
          };
          if (studyLevelCovariates) {
            tableRow.covariatesColumns = buildCovariatesColumns(studyLevelCovariates[study.title]);
          }
          tableRows.push(tableRow);
        });
      });
      return tableRows;
    }

    function cleanUpEvidencePropertyNames(armData) {
      var evidence = {};
      if (armData.hasOwnProperty('responders')) {
        evidence.responders = armData.responders;
      }
      if (armData.hasOwnProperty('sampleSize')) {
        evidence.sampleSize = armData.sampleSize;
      }
      if (armData.hasOwnProperty('mean')) {
        evidence.mean = armData.mean;
      }
      if (armData.hasOwnProperty('std.dev')) {
        evidence.stdDev = armData['std.dev'];
      }
      if (armData.hasOwnProperty('std.err')) {
        evidence.stdErr = armData['std.err'];
      }
      return evidence;
    }

    function buildTreatmentMap(treatments) {
      return _.reduce(treatments, function(accum, treatment) {
        accum[treatment.id] = treatment.name;
        return accum;
      }, {});
    }


    function buildRelativeEffectDataRows(problem) {
      var tableRows = [];
      var treatmentMap = buildTreatmentMap(problem.treatments);

      _.forEach(problem.relativeEffectData.data, function(study, studyTitle) {
        var baseArmRow = {
          studyTitle: studyTitle,
          treatmentTitle: treatmentMap[study.baseArm.treatment],
          studyRowSpan: study.otherArms.length + 1, // plus one for base arm
          baseArmStandardError: study.baseArm.baseArmStandardError,
          showStudyColumn: true
        };
        if (problem.studyLevelCovariates) {
          baseArmRow.covariatesColumns = buildCovariatesColumns(problem.studyLevelCovariates[studyTitle]);
        }
        tableRows.push(baseArmRow);
        study.otherArms.forEach(function(arm) {
          var tableRow = {
            studyTitle: studyTitle,
            studyRowSpan: study.otherArms.length + 1, // plus one for base arm
            treatmentTitle: treatmentMap[arm.treatment],
            meanDifference: arm.meanDifference,
            standardError: arm.standardError,
            showStudyColumn: false
          };
          if (problem.studyLevelCovariates) {
            tableRow.covariatesColumns = buildCovariatesColumns(problem.studyLevelCovariates[studyTitle]);
          }
          tableRows.push(tableRow);
        });
      });
      return tableRows;
    }


    return {
      determineOutcomeType: determineOutcomeType,
      studyMapToStudyArray: studyMapToStudyArray,
      studyListToEvidenceRows: studyListToEvidenceRows,
      buildRelativeEffectDataRows: buildRelativeEffectDataRows
    };

  };

  return dependencies.concat(EvidenceTableService);
});
