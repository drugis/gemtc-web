'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var ModelService = function() {

    function cleanModel(frontEndModel) {
      var model = _.cloneDeep(frontEndModel);
      if (frontEndModel.modelType.mainType === 'node-split')
        model.modelType.details = {
          from: _.omit(frontEndModel.nodeSplitComparison.from, 'sampleSize'),
          to: _.omit(frontEndModel.nodeSplitComparison.to, 'sampleSize')
        };
      if (frontEndModel.modelType.mainType === 'pairwise') {
        model.modelType.details = {
          from: _.omit(frontEndModel.pairwiseComparison.from, 'sampleSize'),
          to: _.omit(frontEndModel.pairwiseComparison.to, 'sampleSize')
        };
      }
      model.modelType = _.omit(model.modelType, 'mainType', 'subType');
      model.modelType.type = frontEndModel.modelType.mainType;
      model.likelihood = frontEndModel.likelihoodLink.likelihood;
      model.link = frontEndModel.likelihoodLink.link;
      if (frontEndModel.outcomeScale.type === 'heuristically') {
        delete model.outcomeScale;
      } else {
        model.outcomeScale = frontEndModel.outcomeScale.value;
      }
      model = _.omit(model, 'pairwiseComparison', 'nodeSplitComparison', 'likelihoodLink');
      return model;
    }
    return {
      cleanModel: cleanModel
    };
  };

  return dependencies.concat(ModelService);
});