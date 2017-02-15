'use strict';
define(['angular', 'angular-mocks', 'controllers'], function() {
  describe('the modelController', function() {
    var scope,
      analysisResource,
      modelResource,
      problemResource,
      pataviTaskIdResource,
      funnelPlotResourceMock,
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
      mockPataviTaskId = {
        uri: 'https://something/1'
      },
      pataviResult,
      pataviResultDeferred,
      pataviService,
      resultsPlotsServiceMock,
      relativeEffectsTableService,
      devianceStatisticsServiceMock,
      diagnosticsService,
      metaRegressionService,
      modelserviceMock,
      analysisServiceMock,
      stateMock,
      modalMock,
      pataviTaskIdDeferred,
      pataviTaskIdResult;

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
        $promise: problemDeferred.promise,
        treatments: [1, 2, 3, 4]
      };
      pataviTaskIdDeferred = $q.defer();
      pataviTaskIdResult = {
        $promise: pataviTaskIdDeferred.promise,
      };
      pataviResultDeferred = $q.defer();
      pataviResult = {
        $promise: pataviResultDeferred.promise,
        relativeEffects: [
          []
        ],
        convergencePlots: {},
        deviancePlot: {},
        rankProbabilities: [],
        tracePlot: [],
        gelmanPlot: [],
        regressor: {
          modelRegressor: {
            mu: 'mu'
          }
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
      resultsPlotsServiceMock = jasmine.createSpyObj('ResultsPlotService', ['prefixImageUris']);
      funnelPlotResourceMock = jasmine.createSpyObj('FunnelPlotResource', ['query']);
      pataviService = jasmine.createSpyObj('PataviService', ['listen']);
      pataviService.listen.and.returnValue(pataviResult);
      relativeEffectsTableService = jasmine.createSpyObj('RelativeEffectsTableService', ['buildTable']);
      devianceStatisticsServiceMock = jasmine.createSpyObj('DevianceStatisticsService', ['buildAbsoluteTable', 'buildRelativeTable']);
      diagnosticsService = jasmine.createSpyObj('DiagnosticsService', ['buildDiagnosticMap', 'compareDiagnostics']);
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', ['getScaleName', 'createNodeSplitOptions']);
      stateMock = jasmine.createSpyObj('$state', ['reload']);
      modalMock = jasmine.createSpyObj('$modal', ['open']);
      metaRegressionService = jasmine.createSpyObj('MetaRegressionService', ['buildCovariatePlotOptions', 'getCovariateSummaries']);
      metaRegressionService.buildCovariatePlotOptions.and.returnValue([]);
      modelserviceMock = jasmine.createSpyObj('ModelService', ['isVariableBinary', 'filterCentering', 'findCentering',
        'addLevelandProcessData', 'selectLevel'
      ]);
      modelserviceMock.isVariableBinary.and.returnValue(true);
      modelserviceMock.filterCentering.and.callFake(function(param) {
        return param;
      });
      modelserviceMock.addLevelandProcessData.and.returnValue([]);
      modelserviceMock.selectLevel.and.returnValue({});
      $controller('ModelController', {
        $scope: scope,
        $stateParams: mockStateParams,
        $modal: modalMock,
        $state: stateMock,
        ModelResource: modelResource,
        FunnelPlotResource: funnelPlotResourceMock,
        ProblemResource: problemResource,
        PataviService: pataviService,
        PataviTaskIdResource: pataviTaskIdResource,
        ResultsPlotService: resultsPlotsServiceMock,
        RelativeEffectsTableService: relativeEffectsTableService,
        AnalysisResource: analysisResource,
        DiagnosticsService: diagnosticsService,
        AnalysisService: analysisServiceMock,
        ModelService: modelserviceMock,
        DevianceStatisticsService: devianceStatisticsServiceMock,
        gemtcRootPath: '',
        MetaRegressionService: metaRegressionService
      });
    }));

    describe('when first initialised', function() {
      it('should attempt to load the model', function() {
        expect(modelResource.get).toHaveBeenCalledWith(mockStateParams);
      });
    });

    describe('when a non-nodesplit model is loaded', function() {
      beforeEach(function() {
        scope.model.modelType = {
          type: 'network'
        };
        scope.model.regressor = {
          variable: {}
        };
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

        it('should listen to the patavi service', function() {
          expect(pataviService.listen).toHaveBeenCalled();
        });

        describe('when the patavi results are ready', function() {

          beforeEach(function() {
            var diagnostics = [{
              key: 'd.3.45'
            }, {
              key: 'd.2.12'
            }, {
              key: 'sd.d'
            }, {
              key: 'd.3.88'
            }, {
              key: 'd.3.29'
            }];
            pataviResultDeferred.resolve(pataviResult);
            diagnosticsService.buildDiagnosticMap.and.returnValue(diagnostics);
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

            it('the diagnostics should be placed on the scope and sorted', function() {
              expect(scope.diagnostics).toBeDefined();
              expect(diagnosticsService.compareDiagnostics).toHaveBeenCalled();
            });

            it('the modelService should process input & add levels for both relative effects and rank probabilities', function() {
              expect(modelserviceMock.addLevelandProcessData).toHaveBeenCalled();
              expect(modelserviceMock.addLevelandProcessData.calls.count()).toBe(2);
            });
            it('the modelService should retrieve the rankProbabilitiesByLevel, the relativeEffectsTables and their default', function() {
              expect(modelserviceMock.selectLevel).toHaveBeenCalled();
              expect(modelserviceMock.selectLevel.calls.count()).toBe(2);
            });
            it('the gelman diagnostics should be labelled', function() {
              expect(diagnosticsService.buildDiagnosticMap).toHaveBeenCalled();
            });

            it('should use the first treatment as the selectedBaseline', function() {
              expect(scope.selectedBaseline).toEqual(mockProblem.treatments[0]);
            });
          });
        });
      });
    });

    describe('when a nodesplit model is loaded', function() {
      beforeEach(function() {
        scope.model.modelType = {
          type: 'node-split'
        };
        modelDeferred.resolve(mockModel);
        pataviTaskIdDeferred.resolve(mockPataviTaskId);
        pataviResultDeferred.resolve(pataviResult);
        problemDeferred.resolve(mockProblem);
        scope.$apply();
      });

      it('the relativeEffectsTable should not be constructed', function() {
        expect(relativeEffectsTableService.buildTable).not.toHaveBeenCalled();
      });
    });

  });
});
