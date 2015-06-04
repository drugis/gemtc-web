'use strict';
define(['angular'], function(angular) {
  var dependencies = [];

  var ProblemValidityService = function() {

    function isTreatmentsValid(treatments) {
      var isValid = true;
      angular.forEach(treatments, function(treatment) {
        isValid = treatment.id && treatment.name;
      })
      return isValid;
    }

    function isEntryValid(entries) {
      return true;
    }

    /*
     * The client should check the input JSON for validity.
     * It must contain the "entries" and "treatment" fields.
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

      if (!problem.entries) {
        result.isValid = false;
        result.messages.push("The problem does not contain a entries fields")
      } else if (isEntryValid(problem.entries)) {
        result.isValid = false;
        result.messages.push("The entries must be a list of data rows \n Each data row must contain at least the study and treatment columns");
      }

      if (!problem.treatment) {
        result.isValid = false;
        result.messages.push("The problem does not contain a treatment fields")
      } else if (isTreatmentsValid(problem.treatment)) {
        result.isValid = false;
        result.messages.push("The treatment field must contain a list of objects that all have name and id")
      }

      return result;
    }

    return {
      getValidity: getValidity
    };
  };
  return dependencies.concat(ProblemValidityService);
});