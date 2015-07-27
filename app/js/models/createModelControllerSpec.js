define(['angular', 'angular-mocks', 'analyses/analyses', 'models/models'], function() {
  describe('the add model controller', function() {
    var scope, q,
      stateParamsMock, stateMock,
      problemDefer,
      pairwiseOptionsDefer,
      modelResourceMock = jasmine.createSpyObj('ModelResource', ['save']),
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', ['createPairwiseOptions']),
      problemResourceMock = jasmine.createSpyObj('ProblemResource', ['get']);

    beforeEach(module('gemtc.models'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;
      q = $q;
      problemDefer = q.defer();
      pairwiseOptionsDefer = q.defer();
      modelSaveDefer = q.defer();
      modelSaveResultMock = {
        $promise: modelSaveDefer.promise
      };

      var problemMock = {
        $promise: problemDefer.promise
      };

      problemResourceMock.get.and.returnValue(problemMock);
      analysisServiceMock.createPairwiseOptions.and.returnValue(pairwiseOptionsDefer.promise);
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
        expect(scope.model.modelType.type).toBe('network');
        expect(scope.model.burnInIterations).toBe(5000);
        expect(scope.model.inferenceIterations).toBe(20000);
        expect(scope.model.thinningFactor).toBe(10);
      });

      it('should get the problem', function() {
        expect(problemResourceMock.get).toHaveBeenCalled();
      });

      it('should create the pairwise options', function() {
        expect(analysisServiceMock.createPairwiseOptions).toHaveBeenCalled();
      });

      it('should place createModel on the scope', function() {
        expect(scope.createModel).toBeDefined();
      });

      it('should place isAddButtonDisabled on the scope', function() {
        expect(scope.isAddButtonDisabled).toBeDefined();
      });
    });

    describe('createModel', function() {

      describe('when creating a random network model', function() {
        var model = {
          linearModel: 'random',
          modelType: {
            type: 'network'
          },
          title: 'modelTitle',
          burnInIterations: 5000,
          inferenceIterations: 20000,
          thinningFactor: 10
        }

        beforeEach(function() {
          modelResourceMock.save.calls.reset();
          scope.createModel(model);
        });

        it('should save the model', function() {
          expect(modelResourceMock.save).toHaveBeenCalledWith(stateParamsMock, model, jasmine.any(Function));
        });
        it('should set isAddingModel to true', function() {
          expect(scope.isAddingModel).toBe(true);
        });
      });

      //FIXME: more tests
    });

  });
});
