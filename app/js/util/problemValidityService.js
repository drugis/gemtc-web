'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var ProblemValidityService = function() {

    function refersToExtantTreatment(entry, treatments) {
      return _.find(treatments, function(treatment) {
        return treatment.id === entry.treatment;
      });
    }

    function areTreatmentsValid(treatments) {
      var isValid = true;
      angular.forEach(treatments, function(treatment) {
        isValid = treatment.id && treatment.name;
      });
      return isValid;
    }

    function areColumnsConsistent(entries) {
      // no such thing as proper array/set equals until ecma6
      var firstColumnProperties =  _.keys(entries[0]).sort().join('');

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

    /*
     * The client should check the input JSON for validity.
     * It must contain the 'entries' and 'treatment" fields.
     * The "treatment" field must contain a list of {"id": $id, "name": $name} objects.
     * The entries must be a list of data rows.
     * Each data row must contain at least the "study" and "treatment" columns.
     * The "treatment" column must refer to a numeric ID present in the treatments list.
     * Each data row must have the same columns as the first data row.
     */
    function getValidity(problem) {
      var result = {
        isValid: true,
        messages: []
      };

      if (!problem || problem.length === 0) {
        result.isValid = false;
        result.messages.push('The problem file is empty.');
      } else {
        if (!problem.entries) {
          result.isValid = false;
          result.messages.push('The problem does not contain a list of entries')
        } else if (!areEntriesValid(problem)) {
          result.isValid = false;
          result.messages.push('The entries must be a list of data rows; Each data row must contain at least the study and treatment columns');
        } else if(!areColumnsConsistent(problem.entries)) {
          result.isValid = false;
          result.messages.push('Each entry must have the same data columns');
        }

        if (!problem.treatments) {
          result.isValid = false;
          result.messages.push('The problem does not contain a list of treatments')
        } else if (!areTreatmentsValid(problem.treatments)) {
          result.isValid = false;
          result.messages.push('The treatments field must contain a list of objects that all have name and id')
        }
      }
      return result;
    }

    return {
      getValidity: getValidity
    };
  };
  return dependencies.concat(ProblemValidityService);
});