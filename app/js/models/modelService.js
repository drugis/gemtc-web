'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var ModelService = function() {

    function enrich(model, problem) {
      function getTreatmentName(id) {
        return _.find(problem.treatments, function(treatment) {
          return treatment.id === id;
        }).name;
      }

      if (model && model.modelType && model.modelType.details) {
        model.modelType.details.to = {
            id: model.modelType.details.to,
            name: getTreatmentName(model.modelType.details.to)
          },
          model.modelType.details.from = {
            id: model.modelType.details.from,
            name: getTreatmentName(model.modelType.details.from)
          }
      }

      return model;
    }

    return {
      enrich: enrich
    };
  };

  return dependencies.concat(ModelService);
});