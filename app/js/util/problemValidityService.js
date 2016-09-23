'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var ProblemValidityService = function() {

    function refersToExtantTreatment(entry, treatments) {
      return !!_.find(treatments, function(treatment) {
        return treatment.id === entry.treatment;
      });
    }

    function areTreatmentsValid(treatments) {
      var isValid = true;
      angular.forEach(treatments, function(treatment) {
        isValid = treatment.id !== undefined && treatment.name;
      });
      return isValid;
    }

    function areColumnsConsistent(entries) {
      // no such thing as proper array/set equals until ecma6
      var firstColumnProperties = _.keys(entries[0]).sort().join('');

      return !_.find(entries, function(entry) {
        return _.keys(entry).sort().join('') !== firstColumnProperties;
      });

    }

    function areEntriesValid(problem) {
      var isValid = true;
      angular.forEach(problem.entries, function(entry) {
        isValid = isValid && entry && entry.study && entry.treatment;
        isValid = isValid && refersToExtantTreatment(entry, problem.treatments);
      });
      return isValid;
    }

    function hasMixedStudyEntry(problem) {
      return !!_.find(problem.entries, function(entry) {
        return _.includes(_.keys(problem.relativeEffectData.data), entry.study.toString());
      });
    }

    /**
     * A single base (reference) arm per study ("baseArm"),
     * which has a treatment and a "baseArmStandardError".
     *  The "baseArmStandardError" may be missing only if the study has < 3 arms.
     **/
    function hasMissingBaseArm(problem) {
      return !!_.find(_.values(problem.relativeEffectData.data), function(effect) {
        return !effect.baseArm.baseArmStandardError && effect.otherArms.length >= 2; // 3 minus base arm
      });
    }

    /**
     * the base arm should have at least a study and treatment
     * the other arms should also have a mean difference and standard error.
     **/
    function hasMalformedRelativeEntry(problem) {
      function isRelativeEntryMalformed(entry) {
        return entry.treatment === undefined ||
          entry.meanDifference === undefined || entry.standardError === undefined ||
          !refersToExtantTreatment(entry, problem.treatments);
      }
      return !!_.values(problem.relativeEffectData.data).find(function(study) {
        return study.baseArm === undefined || study.baseArm.treatment === undefined ||
          !refersToExtantTreatment(study.baseArm, problem.treatments) ||
          _.find(study.otherArms, isRelativeEntryMalformed);
      });
    }

    /**
     * It is an error if there is an arm with standard error lower than that of the base arm.
     **/
    function hasTooHighBaseArmStandardError(problem) {
      return !!_.values(problem.relativeEffectData.data).find(function(study) {
        if (study.baseArm && study.baseArm.baseArmStandardError) {
          return _.find(study.otherArms, function(otherArm) {
            return otherArm.standardError <= study.baseArm.baseArmStandardError;
          });
        }
      });
    }

    /**
     * It is an error if there is only one covariate level
     **/

    function hasOnlyOneCovariateLevel(problem) {
      if (!problem.studyLevelCovariates) {
        return false;
      }
      var studies = _.values(problem.studyLevelCovariates);
      var covariates = _.keys(studies[0]);
      return _.find(covariates, function(covariate) {
        return _.uniq(_.map(studies, covariate)).length < 2;
      });
    }

    function isAllowedScale(scale) {
      return ['log odds ratio', 'log risk ratio', 'log hazard ratio', 'mean difference'].indexOf(scale) > -1;
    }

    /**
     * The client should check the input JSON for validity.
     * It must contain the 'entries' and 'treatment" fields.
     * The "treatment" field must contain a list of {"id": $id, "name": $name} objects.
     * The entries must be a list of data rows.
     * Each data row must contain at least the "study" and "treatment" columns.
     * The "treatment" column must refer to a numeric ID present in the treatments list.
     * Each data row must have the same columns as the first data row.
     **/
    function getValidity(problem) {
      var result = {
        problem: problem,
        isValid: true,
        message: ""
      };

      if (!problem || problem.length === 0) {
        result.isValid = false;
        result.message += ' The problem file is empty.';
      } else {
        if (!problem.entries) {
          result.isValid = false;
          result.message += ' The problem does not contain a list of entries';
        } else if (!areEntriesValid(problem)) {
          result.isValid = false;
          result.message += ' The entries must be a list of data rows, each data row must contain at least the study and treatment columns';
        } else if (!areColumnsConsistent(problem.entries)) {
          result.isValid = false;
          result.message += ' Each entry must have the same data columns';
        }

        if (!problem.treatments) {
          result.isValid = false;
          result.message += ' The problem does not contain a list of treatments';
        } else if (!areTreatmentsValid(problem.treatments)) {
          result.isValid = false;
          result.message += ' The treatments field must contain a list of objects that all have name and id';
        }

        if (problem.studyLevelCovariates) {
          if (hasOnlyOneCovariateLevel(problem)) {
            result.isValid = false;
            result.message += ' Covariates must have more than one level';
          }
        }

        if (problem.relativeEffectData) {
          if (hasMalformedRelativeEntry(problem)) {
            result.isValid = false;
            result.message += ' Relative effects data must have at least a study and a treatment, and for non-base arms a mean difference and standard error.';
          } else {
            if (hasMixedStudyEntry(problem)) {
              result.isValid = false;
              result.message += ' Studies may not have both relative effects data and absolute data';
            }
            if (hasMissingBaseArm(problem)) {
              result.isValid = false;
              result.message += ' Relative effects data must contain baseArmStandardError if the study contains more than 2 arms';
            }
            if (hasTooHighBaseArmStandardError(problem)) {
              result.isValid = false;
              result.message += ' Relative effects data may not contain a base arm with standard error higher than that of another arms';
            }
            if (!problem.relativeEffectData.scale || !isAllowedScale(problem.relativeEffectData.scale)) {
              result.isValid = false;
              result.message += ' Relative effects data must define a valid scale.';
            }
          }
        }

      }
      return result;
    }

    function parse(inputString) {
      var isValidJsonString = inputString && ((typeof inputString) === 'string') && /^[\],:{}\s]*$/.test(
        inputString.replace(/\\["\\\/bfnrtu]/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
      );

      if (isValidJsonString) {
        return {
          problem: JSON.parse(inputString),
          isValid: true
        };
      } else {
        return {
          isValid: false,
          message: 'The file does not containt a valid json object'
        };
      }


    }

    return {
      getValidity: getValidity,
      parse: parse
    };
  };
  return dependencies.concat(ProblemValidityService);
});
