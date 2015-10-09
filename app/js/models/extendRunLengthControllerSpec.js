define(['angular', 'angular-mocks', 'analyses/analyses', 'models/models'], function() {
  describe('the extend runlength controller', function() {
    var scope,
      q,
      stateParamsMock,
      modelResourceMock = jasmine.createSpyObj('ModelResource', ['save']),
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', ['estimateRunLength']),
      modalInstanceMock,
      modelMock = {
        burnInIterations: 100,
        inferenceIterations: 200,
        thinningFactor: 10
      },
      problemMock,
      successCallbackMock;


    beforeEach(module('gemtc.models'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;
      $controller('ExtendRunLengthController', {
        $scope: scope,
        $modalInstance: modalInstanceMock,
        $stateParams: stateParamsMock,
        model: modelMock,
        problem: problemMock,
        successCallback: successCallbackMock,
        ModelResource: modelResourceMock,
        AnalysisService: analysisServiceMock
      });
    }));

    describe('when first initialised', function() {
      beforeEach(function() {
        modelMock = {
          burnInIterations: 100,
          inferenceIterations: 200,
          thinningFactor: 10
        };
      });
      it('should place runlength settings on the scope', function() {
        expect(scope.model.burnInIterations).toBe(modelMock.burnInIterations);
      });
      describe('isExtendButtonDisabled function on the scope', function() {
        it('should be on the scope', function() {
          expect(scope.isExtendButtonDisabled).toBeDefined();
        });
        it('should return true for burnInIterations not divisible by the thinningFactor', function() {
          var model = {
            burnInIterations: 17,
            inferenceIterations: 100,
            thinningFactor: 10
          };
          expect(scope.isExtendButtonDisabled(model)).toBe(true);
        });
        it('should return true for inferenceIterations not divisible by the thinningFactor', function() {
          var model = {
            burnInIterations: 20,
            inferenceIterations: 107,
            thinningFactor: 10
          };
          expect(scope.isExtendButtonDisabled(model)).toBe(true);
        });
        it('should return false for correct model', function() {
          var model = {
            burnInIterations: 30,
            inferenceIterations: 100,
            thinningFactor: 10
          };
          expect(scope.isExtendButtonDisabled(model)).toBe(false);
        });
      });
    });

    describe('extend button is pressed', function() {
      it('should save the model with new settings ', function() {
        modelMock.burnInIterations = 20;
        modelMock.inferenceIterations = 107;
        modelMock.thinningFactor = 10;

        var saveResult = {
          $promise: {
            then: function() {}
          }
        };

        modelResourceMock.save.and.returnValue(saveResult);
        scope.extendRunLength(modelMock);
        expect(modelResourceMock.save).toHaveBeenCalledWith(stateParamsMock, modelMock);
      });

    });

  });
});