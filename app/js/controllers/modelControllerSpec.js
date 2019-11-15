'use strict';
define(['angular', 'angular-mocks', 'gemtc-web/controllers'], function(angular) {
  describe('the modelController', function() {
    var scope;
    var analysisDeferred;
    var analysisMock;
    var analysisResource;
    var analysisServiceMock;
    var devianceStatisticsServiceMock;
    var diagnosticsService;
    var funnelPlotResourceMock;
    var metaRegressionService;
    var modelBaselineDefer;
    var modelBaselineMock;
    var modelBaselineResource;
    var modelDeferred;
    var modalMock;
    var modelMock;
    var modelResource;
    var modelserviceMock;
    var pageTitleServiceMock;
    var pataviResult;
    var pataviResultDeferred;
    var pataviService;
    var pataviTaskIdDeferred;
    var pataviTaskIdMock = {
      uri: 'https://something/1'
    };
    var pataviTaskIdResource;
    var pataviTaskIdResult;
    var problemDeferred;
    var problemMock;
    var problemResource;
    var stateParamsMock = {
      analysisId: 1,
      projectId: 11
    };
    var resultsPlotsServiceMock;
    var relativeEffectsTableService;
    var stateMock;

    beforeEach(angular.mock.module('gemtc.controllers'));

    beforeEach(inject(function($rootScope, $controller, $q, $httpBackend) {
      scope = $rootScope.$new();
      scope.$parent.analysis = {
        outcome: 'outcome'
      };
      modelDeferred = $q.defer();
      modelMock = {
        $promise: modelDeferred.promise
      };
      modelBaselineDefer = $q.defer();
      modelBaselineMock = {
        $promise: modelBaselineDefer.promise
      };
      analysisDeferred = $q.defer();
      analysisMock = {
        $promise: analysisDeferred.promise
      };
      problemDeferred = $q.defer();
      problemMock = {
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
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', ['getScaleName', 'createNodeSplitOptions']);
      analysisResource = jasmine.createSpyObj('AnalysisResource', ['get']);
      analysisResource.get.and.returnValue(analysisMock);
      devianceStatisticsServiceMock = jasmine.createSpyObj('DevianceStatisticsService', ['buildAbsoluteTable', 'buildRelativeTable']);
      diagnosticsService = jasmine.createSpyObj('DiagnosticsService', ['buildDiagnosticMap', 'compareDiagnostics']);
      funnelPlotResourceMock = jasmine.createSpyObj('FunnelPlotResource', ['query']);
      metaRegressionService = jasmine.createSpyObj('MetaRegressionService', ['buildCovariatePlotOptions', 'getCovariateSummaries']);
      metaRegressionService.buildCovariatePlotOptions.and.returnValue([]);
      modelBaselineResource = jasmine.createSpyObj('ModelBaselineResource', ['get']);
      modelBaselineResource.get.and.returnValue(modelBaselineMock);
      modalMock = jasmine.createSpyObj('$modal', ['open']);
      modelResource = jasmine.createSpyObj('ModelResource', ['get']);
      modelResource.get.and.returnValue(modelMock);
      modelserviceMock = jasmine.createSpyObj('ModelService', ['isVariableBinary', 'filterCentering', 'findCentering',
        'addLevelandProcessData', 'selectLevel'
      ]);
      modelserviceMock.isVariableBinary.and.returnValue(true);
      modelserviceMock.filterCentering.and.callFake(function(param) {
        return param;
      });
      modelserviceMock.addLevelandProcessData.and.returnValue([]);
      modelserviceMock.selectLevel.and.returnValue({});
      pageTitleServiceMock = jasmine.createSpyObj('PageTitleService', ['setPageTitle']);
      pataviService = jasmine.createSpyObj('PataviService', ['listen']);
      pataviService.listen.and.returnValue(pataviResult);
      pataviTaskIdResource = jasmine.createSpyObj('PataviTaskIdResource', ['get']);
      pataviTaskIdResource.get.and.returnValue(pataviTaskIdResult);
      problemResource = jasmine.createSpyObj('ProblemResource', ['get']);
      problemResource.get.and.returnValue(problemMock);
      resultsPlotsServiceMock = jasmine.createSpyObj('ResultsPlotService', ['prefixImageUris']);
      relativeEffectsTableService = jasmine.createSpyObj('RelativeEffectsTableService', ['buildTable']);
      stateMock = jasmine.createSpyObj('$state', ['reload']);

      $httpBackend.when('GET', pataviTaskIdMock.uri).respond('foo');

      $controller('ModelController', {
        $scope: scope,
        $stateParams: stateParamsMock,
        $modal: modalMock,
        $state: stateMock,
        AnalysisResource: analysisResource,
        AnalysisService: analysisServiceMock,
        DevianceStatisticsService: devianceStatisticsServiceMock,
        DiagnosticsService: diagnosticsService,
        FunnelPlotResource: funnelPlotResourceMock,
        MetaRegressionService: metaRegressionService,
        ModelBaselineResource: modelBaselineResource,
        ModelResource: modelResource,
        ModelService: modelserviceMock,
        PataviService: pataviService,
        PataviTaskIdResource: pataviTaskIdResource,
        ProblemResource: problemResource,
        RelativeEffectsTableService: relativeEffectsTableService,
        ResultsPlotService: resultsPlotsServiceMock,
        PageTitleService: pageTitleServiceMock
      });
    }));

    describe('when first initialised', function() {
      it('should attempt to load the model', function() {
        expect(modelResource.get).toHaveBeenCalledWith(stateParamsMock);
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
        modelDeferred.resolve(modelMock);
        scope.$apply();
      });

      it('should retrieve the associated patavi task id', function() {
        expect(pataviTaskIdResource.get).toHaveBeenCalledWith(stateParamsMock);
      });

      describe('when the patavi task id is available', function() {
        beforeEach(function() {
          pataviTaskIdDeferred.resolve(pataviTaskIdMock);
          scope.$apply();
        });

        it('should listen to the patavi service', function() {
          expect(pataviService.listen).toHaveBeenCalled();
        });

        describe('when the patavi results are ready', function() {

          beforeEach(function() {
            var diagnostics = [
              { key: 'd.3.45' },
              { key: 'd.2.12' },
              { key: 'sd.d' },
              { key: 'd.3.88' },
              { key: 'd.3.29' }
            ];
            beforeEach(function() {
              pataviResultDeferred.resolve(pataviResult);
              diagnosticsService.buildDiagnosticMap.and.returnValue(diagnostics);
              scope.$apply();
            });

            it('should retrieve the problem', function() {
              expect(problemResource.get).toHaveBeenCalledWith(stateParamsMock);
            });

            describe('when the problem is loaded', function() {
              problemDeferred.resolve(problemMock);
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
              expect(scope.selectedBaseline).toEqual(problemMock.treatments[0]);
            });
          });
        });
      });
    });

    describe('when a nodesplit model is loaded', function() {
      beforeEach(function() {
        scope.model.modelType = {
          type: 'node-split',
          details: {
            from: {
              id: 1
            },
            to: {
              id: 2
            }
          }
        };
        modelDeferred.resolve(modelMock);
        pataviTaskIdDeferred.resolve(pataviTaskIdMock);
        pataviResultDeferred.resolve(pataviResult);
        problemDeferred.resolve(problemMock);
        scope.$apply();
      });

      it('the relativeEffectsTable should not be constructed', function() {
        expect(relativeEffectsTableService.buildTable).not.toHaveBeenCalled();
      });
    });

  });
});
