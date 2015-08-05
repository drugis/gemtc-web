define(['angular', 'angular-mocks', 'controllers'], function() {
  describe('the modelController', function() {
    var scope,
      analysisResource,
      modelResource,
      problemResource,
      pataviTaskIdResource,
      mockStateParams = {
        analysisId: 1,
        projectId: 11
      },
      analysisDeferred,
      mockAnalysis,
      modelDeferred,
      mockModel,
      problemDeferred,
      mockProblem,
      mockPataviTaskId,
      pataviResult,
      pataviResultDeferred,
      pataviService,
      relativeEffectsTableService,
      diagnosticsService,
      modelServiceMock,
      analysisServiceMock;

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
      analysisDeferred = $q.defer();
      mockAnalysis = {
        $promise: analysisDeferred.promise
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
      analysisResource = jasmine.createSpyObj('AnalysisResource', ['get']);
      analysisResource.get.and.returnValue(mockAnalysis);
      modelResource = jasmine.createSpyObj('ModelResource', ['get']);
      modelResource.get.and.returnValue(mockModel);
      problemResource = jasmine.createSpyObj('ProblemResource', ['get']);
      problemResource.get.and.returnValue(mockProblem);
      pataviTaskIdResource = jasmine.createSpyObj('PataviTaskIdResource', ['get']);
      pataviTaskIdResource.get.and.returnValue(pataviTaskIdResult);
      pataviService = jasmine.createSpyObj('PataviService', ['run']);
      pataviService.run.and.returnValue(pataviResult);
      relativeEffectsTableService = jasmine.createSpyObj('RelativeEffectsTableService', ['buildTable']);
      diagnosticsService = jasmine.createSpyObj('DiagnosticsService', ['labelDiagnostics']);
      modelServiceMock = jasmine.createSpyObj('ModelService', ['enrich']);
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', ['getScaleName']);


      $controller('ModelController', {
        $scope: scope,
        $stateParams: mockStateParams,
        ModelResource: modelResource,
        ProblemResource: problemResource,
        PataviService: pataviService,
        PataviTaskIdResource: pataviTaskIdResource,
        RelativeEffectsTableService: relativeEffectsTableService,
        AnalysisResource: analysisResource,
        DiagnosticsService: diagnosticsService,
        ModelService: modelServiceMock,
        AnalysisService: analysisServiceMock
      });
    }));

    describe('when first initialised', function() {
      it('should attempt to load the model', function() {
        expect(modelResource.get).toHaveBeenCalledWith(mockStateParams);
      });
      it('should set convergence plots to hidden', function() {
        expect(scope.isConvergencePlotsShown).toBe(false);
      });
      it('should make hideConvergencePlots available on the scope', function() {
        expect(scope.hideConvergencePlots).toBeDefined();
      });
      it('should make showConvergencePlots available on the scope', function() {
        expect(scope.showConvergencePlots).toBeDefined();
      });
      it('hideConvergencePlots should set convergence plots to hidden', function() {
        scope.hideConvergencePlots();
        expect(scope.isConvergencePlotsShown).toBe(false);
      });
      it('hideConvergencePlots should set convergence plots to shown', function() {
        scope.showConvergencePlots();
        expect(scope.isConvergencePlotsShown).toBe(true);
      });
    });

    describe('when a non-nodesplit model is loaded', function() {
      beforeEach(function() {
        scope.model.modelType = {
          type: 'network'
        };
        modelServiceMock.enrich.and.returnValue(scope.model);
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

            it('the gelman diagnostics should be labelled', inject(function() {
              expect(diagnosticsService.labelDiagnostics).toHaveBeenCalled();
            }));
          });
        });
      });
    });

    describe('when a nodesplit model is loaded', function() {
      beforeEach(function() {
        scope.model.modelType = {
          type: 'node-split'
        };
        modelServiceMock.enrich.and.returnValue(scope.model);
        modelDeferred.resolve(mockModel);
        pataviTaskIdDeferred.resolve(mockPataviTaskId);
        pataviResultDeferred.resolve(pataviResult);
        problemDeferred.resolve(mockProblem);
        scope.$apply();
      });

      it('the relativeEffectsTable should not be constructed', inject(function() {
        expect(relativeEffectsTableService.buildTable).not.toHaveBeenCalled();
      }));
    });

  });
});