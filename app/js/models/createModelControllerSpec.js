define(['angular', 'angular-mocks', 'analyses/analyses', 'models/models'], function() {
  describe('the create model controller', function() {
    var scope, q,
      stateParamsMock, stateMock,
      problemDefer,
      pairwiseOptionsMock = ['pairwise 1'],
      nodeSplitOptionsMock = ['nodesplit 1'],
      likelihoodLinkOptionsMock = [],
      modelSaveDefer,
      problemMock,
      modelSaveResultMock,
      modelResourceMock = jasmine.createSpyObj('ModelResource', ['save']),
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', [
        'createPairwiseOptions',
        'createNodeSplitOptions',
        'createLikelihoodLinkOptions',
        'estimateRunLength',
      ]),
      problemResourceMock = jasmine.createSpyObj('ProblemResource', ['get']);

    beforeEach(module('gemtc.models'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;
      q = $q;
      problemDefer = q.defer();
      modelSaveDefer = q.defer();
      modelSaveResultMock = {
        $promise: modelSaveDefer.promise
      };

      problemMock = {
        $promise: problemDefer.promise
      };

      problemResourceMock.get.and.returnValue(problemMock);
      analysisServiceMock.createPairwiseOptions.and.returnValue(pairwiseOptionsMock);
      analysisServiceMock.createNodeSplitOptions.and.returnValue(nodeSplitOptionsMock);
      analysisServiceMock.createLikelihoodLinkOptions.and.returnValue(likelihoodLinkOptionsMock);
      modelResourceMock.save.and.returnValue(modelSaveResultMock);

      $controller('CreateModelController', {
        $scope: scope,
        $q: q,
        $stateParams: stateParamsMock,
        $state: stateMock,
        ModelResource: modelResourceMock,
        AnalysisService: analysisServiceMock,
        ProblemResource: problemResourceMock
      });
    }));

    describe('when first initialised', function() {

      it('should place a basic model on the scope', function() {
        expect(scope.model.linearModel).toBe('random');
        expect(scope.model.modelType.mainType).toBe('network');
        expect(scope.model.burnInIterations).toBe(5000);
        expect(scope.model.inferenceIterations).toBe(20000);
        expect(scope.model.thinningFactor).toBe(10);
      });

      it('should get the problem', function() {
        expect(problemResourceMock.get).toHaveBeenCalled();
      });

      it('should place createModel on the scope', function() {
        expect(scope.createModel).toBeDefined();
      });

      it('should place isAddButtonDisabled on the scope', function() {
        expect(scope.isAddButtonDisabled).toBeDefined();
      });
    });

    describe('once the problem is loaded', function() {
      beforeEach(function() {
        likelihoodLinkOptionsMock = [{
          name: 'option 1',
          compatibility: 'incompatible'
        }, {
          name: 'option 2',
          compatibility: 'compatible'
        }];
        problemDefer.resolve(problemMock);
        scope.$apply();
      });
      it('should retrieve pairwise options', function() {
        expect(analysisServiceMock.createPairwiseOptions).toHaveBeenCalledWith(problemMock);
      });
      it('should retrieve nodesplitting options', function() {
        expect(analysisServiceMock.createNodeSplitOptions).toHaveBeenCalledWith(problemMock);
      });
      it('should retrieve likelihood link options and place them on the scope, and set the model ll/link function to be the first compatible one' , function() {
        expect(analysisServiceMock.createLikelihoodLinkOptions).toHaveBeenCalledWith(problemMock);
        expect(scope.likelihoodLinkOptions[0]).toEqual(likelihoodLinkOptionsMock[1]);
        expect(scope.likelihoodLinkOptions[1]).toEqual(likelihoodLinkOptionsMock[0]);
        expect(scope.model.likelihoodLink).toEqual(likelihoodLinkOptionsMock[1]);
      });
    });

    describe('createModel', function() {

      describe('when creating a random network model', function() {
        var model = {
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
          }
        };

        var cleanedModel = {
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

        beforeEach(function() {
          modelResourceMock.save.calls.reset();
          scope.createModel(model);
        });

        it('should save the model', function() {
          expect(modelResourceMock.save).toHaveBeenCalledWith(stateParamsMock, cleanedModel, jasmine.any(Function));
        });
        it('should set isAddingModel to true', function() {
          expect(scope.isAddingModel).toBe(true);
        });
      });

      describe('when creating nodesplitting model', function() {
        var frontendModel = {
          linearModel: 'random',
          modelType: {
            mainType: 'node-split'
          },
          title: 'modelTitle nodesplit',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihoodLink: {
            likelihood: 'likelihood',
            link: 'link'
          },
          nodeSplitComparison: {
            from: {
              id: 1,
              name: 'fromName'
            },
            to: {
              id: 2,
              name: 'toName'
            }
          },
          outcomeScale: {
            type: 'heuristically'
          }
        };

        var strippedModel = {
          linearModel: 'random',
          likelihood: 'likelihood',
          link: 'link',
          modelType: {
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
          },
          title: 'modelTitle nodesplit',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10
        };

        beforeEach(function() {
          modelResourceMock.save.calls.reset();
          scope.createModel(frontendModel);
        });

        it('should save the strippedModel model', function() {
          expect(modelResourceMock.save).toHaveBeenCalledWith(stateParamsMock, strippedModel, jasmine.any(Function));
        });
        it('should set isAddingModel to true', function() {
          expect(scope.isAddingModel).toBe(true);
        });
      });

      describe('when creating model that has the outcome scale set', function() {
        var frontendModel = {
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
            type: 'fixed',
            value: 123456
          }
        };

        var cleanedModel = {
          linearModel: 'random',
          modelType: {
            type: 'network'
          },
          title: 'modelTitle',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10,
          likelihood: 'likelihood',
          link: 'link',
          outcomeScale: 123456
        };

        beforeEach(function() {
          modelResourceMock.save.calls.reset();
          scope.createModel(frontendModel);
        });

        it('should place the scale value on the model', function() {
          expect(modelResourceMock.save).toHaveBeenCalledWith(stateParamsMock, cleanedModel, jasmine.any(Function));
        });
      });
    });

    describe('isAddButtonDisabled', function() {

      it('should return true if the estimateRunLength is greater than 300', function() {
        var model = {
          title: 'title',
          burnInIterations: 1000,
          inferenceIterations: 100,
          thinningFactor: 10
        };

        scope.estimateRunLength = 301;

        expect(scope.isAddButtonDisabled(model)).toBe(true);
      });

      it('should return false the model is ready to save', function() {
        var model = {
          title: 'title',
          burnInIterations: 1000,
          inferenceIterations: 100,
          thinningFactor: 10
        };

        scope.estimateRunLength = 299;
        scope.isAddingModel = false;
        model.likelihoodLink = {
          compatibility: 'compatibility'
        };
        model.outcomeScale = {
          outcomeScale: {
            value: 1,
            type: 'fixed'
          }
        };

        expect(scope.isAddButtonDisabled(model)).toBe(false);
      });
    });



  });
});
