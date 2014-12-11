define(['angular', 'angular-mocks', 'controllers'], function() {
  describe('the modelController', function() {
    var scope, modelResource,
      problemResource,
      pataviTaskIdResource,
      mockStateParams = {
        analysisId: 1,
        projectId: 11
      },
      modelDeferred,
      mockModel,
      problemDeferred,
      mockProblem,
      mockPataviTaskId,
      pataviResult,
      pataviResultDeferred,
      pataviService,
      relativeEffectsTableService;

    beforeEach(module('gemtc.controllers'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;
      scope.$parent = {
        analysis: {
          outcome: 'outcome'
        }
      };
      modelDeferred = $q.defer();
      mockModel = {
        $promise: modelDeferred.promise
      };
      problemDeferred = $q.defer();
      mockProblem = {
        $promise: problemDeferred.promise
      };
      pataviTaskIdDeferred = $q.defer();
      pataviTaskIdResult = {
        $promise: pataviTaskIdDeferred.promise,
      };
      pataviResultDeferred = $q.defer();
      pataviResult = {
        $promise: pataviResultDeferred.promise,
        results: {
          relativeEffects: [],
          rankProbabilities: []
        },
        logScale: true
      };
      modelResource = jasmine.createSpyObj('ModelResource', ['get']);
      modelResource.get.and.returnValue(mockModel);
      problemResource = jasmine.createSpyObj('ProblemResource', ['get']);
      problemResource.get.and.returnValue(mockProblem);
      pataviTaskIdResource = jasmine.createSpyObj('PataviTaskIdResource', ['get']);
      pataviTaskIdResource.get.and.returnValue(pataviTaskIdResult);
      pataviService = jasmine.createSpyObj('PataviService', ['run']);
      pataviService.run.and.returnValue(pataviResult);
      relativeEffectsTableService = jasmine.createSpyObj('RelativeEffectsTableService', ['buildTable']);

      $controller('ModelController', {
        $scope: scope,
        $stateParams: mockStateParams,
        ModelResource: modelResource,
        ProblemResource: problemResource,
        PataviService: pataviService,
        PataviTaskIdResource: pataviTaskIdResource,
        RelativeEffectsTableService: relativeEffectsTableService
      });
    }));

    describe('when first initialised', function() {
      it('should attempt to load the model', function() {
        expect(modelResource.get).toHaveBeenCalledWith(mockStateParams);
      });
    });

    describe('when the model is loaded', function() {
      beforeEach(function() {
        modelDeferred.resolve(mockModel);
        scope.$apply();
      });

      it('should retrieve the associated patavi task id', function() {
        expect(pataviTaskIdResource.get).toHaveBeenCalledWith(mockStateParams);
      });

      describe('when the patavi task id is available', function() {

        beforeEach(function() {
          pataviTaskIdDeferred.resolve(mockPataviTaskId);
          scope.$apply();
        });

        it('should call the patavi service', function() {
          expect(pataviService.run).toHaveBeenCalled();
        });

        describe('when the patavi results are ready', function() {

          beforeEach(function() {
            pataviResultDeferred.resolve(pataviResult);
            scope.$apply();
          });

          it('should retrieve the problem', function() {
            expect(problemResource.get).toHaveBeenCalledWith(mockStateParams);
          });

          describe('when the problem is loaded', function() {
            beforeEach(function() {
              problemDeferred.resolve(mockProblem);
              scope.$apply();
            });

            it('the relativeEffectsTable should be constructed', inject(function() {
              expect(relativeEffectsTableService.buildTable).toHaveBeenCalled();
            }));
          });
        });
      });
    });
  });
});