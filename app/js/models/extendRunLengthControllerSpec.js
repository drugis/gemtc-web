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
    });

    describe('isRunLengthsAbovePrevious function on the scope', function() {
      it('should be on the scope', function() {
        expect(scope.isRunLengthsAbovePrevious).toBeDefined();
      });
      it('should return true if the settings are higher', function() {
        modelMock.burnInIterations = modelMock.burnInIterations + 1
        expect(scope.isRunLengthsAbovePrevious()).toBe(true);
      });
      it('should return false if the settings are lower', function() {
        modelMock.burnInIterations = modelMock.burnInIterations - 1
        expect(scope.isRunLengthsAbovePrevious()).toBe(false);
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