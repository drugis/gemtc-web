'use strict';
define([], function() {
  var dependencies = ['ModelResource', 'ModelService'];

  var RefineModelService = function(ModelResource, ModelService) {

    function getRefinedModel($stateParams) {
      return ModelResource.get($stateParams).$promise.then(function(model) {
        delete model.title;
        delete model.id;
        delete model.taskUrl;

        return ModelService.toFrontEnd(model);
      });
    }

    return {
      getRefinedModel: getRefinedModel
    };
  };

  return dependencies.concat(RefineModelService);
});
