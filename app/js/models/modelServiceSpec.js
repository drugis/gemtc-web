define(['angular', 'angular-mocks', 'services'], function() {
  describe('the deviance statistics service', function() {
    beforeEach(module('gemtc.models'));

    var modelService;


    beforeEach(inject(function(ModelService) {
      modelService = ModelService;
    }));

    describe('cleanModel', function() {
      var frontEndModel, cleanedModel;

      beforeEach(function() {
        frontEndModel = {
          linearModel: 'random',
          modelType: {
            mainType: 'network'
          },
          title: 'modelTitle',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihoodLink: {
            likelihood: 'likelihood',
            link: 'link'
          },
          outcomeScale: {
            type: 'heuristically'
          },
          heterogeneityPrior: {
            type: 'automatic'
          }
        };
        cleanedModel = {
          linearModel: 'random',
          modelType: {
            type: 'network'
          },
          title: 'modelTitle',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihood: 'likelihood',
          link: 'link'
        };
      });

      it('should clean a random-effects network front-end model with automatic heterogeneityPrior', function() {
        expect(modelService.cleanModel(frontEndModel)).toEqual(cleanedModel);
      });
      it('should clean a random-effects node-splitting model where heterogeneityPrior has been set', function() {
        frontEndModel.modelType = {
          mainType: 'node-split'
        };
        frontEndModel.nodeSplitComparison = {
          from: {
            id: 1,
            name: 'fromName'
          },
          to: {
            id: 2,
            name: 'toName'
          }
        };
        frontEndModel.heterogeneityPrior = {
          type: 'standard-deviation',
          values: {
            lower: 0.1,
            upper: 0.2,
          }
        };

        cleanedModel.modelType = {
          type: 'node-split',
          details: {
            from: {
              id: 1,
              name: 'fromName'
            },
            to: {
              id: 2,
              name: 'toName'
            }
          }
        };
        cleanedModel.heterogeneityPrior = {
          type: 'standard-deviation',
          values: {
            lower: 0.1,
            upper: 0.2,
          }
        };
        expect(modelService.cleanModel(frontEndModel)).toEqual(cleanedModel);
      });
      it('should clean a random-effects pairwise model where the outcomeScale has been set', function() {
        frontEndModel.modelType = {
          mainType: 'pairwise'
        };
        frontEndModel.pairwiseComparison = {
          from: {
            id: 1
          },
          to: {
            id: 2
          }
        };
        frontEndModel.outcomeScale = {
          type: 'fixed',
          value: 123456
        };

        cleanedModel.modelType = {
          details: {
            from: {
              id: 1
            },
            to: {
              id: 2
            }
          },
          type: 'pairwise'
        }
        cleanedModel.outcomeScale = 123456;
        expect(modelService.cleanModel(frontEndModel)).toEqual(cleanedModel);
      });
    });
  });
});