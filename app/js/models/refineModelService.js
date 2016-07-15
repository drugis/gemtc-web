'use strict';
define([], function() {
  var dependencies = ['ModelResource', 'ModelService'];

  var RefineModelService = function(ModelResource, ModelService) {

    function getRefinedModel(analysisId, modelId) {
      return ModelResource.get({
        analysisId: analysisId,
        modelId: modelId
      }).$promise.then(function(model) {
        delete model.title;
        delete model.id;
        delete model.taskUrl;

        return ModelService.toFrontEnd(model);
      });
    }

    return {
      getRefinedModel : getRefinedModel
    };
  };

  return dependencies.concat(RefineModelService);
});
