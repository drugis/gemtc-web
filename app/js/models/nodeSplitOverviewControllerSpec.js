define(['angular', 'angular-mocks', 'models/models'], function() {
  describe('the nodesplit overview controller', function() {
    var scope,
      q,
      stateParamsMock = {
        analysisId: 103,
        modelId: 2
      },
      modalMock = jasmine.createSpyObj('$modal', ['open']),
      modelsMock = [{
        id: 1,
        modelType: {
          type: 'network'
        },
        likelihood: 'normal'
      }, {
        id: 2,
        likelihood: 'binom',
        modelType: {
          type: 'node-split',
          details: {
            from: {
              id: 1
            },
            to: {
              id: 2
            }
          }
        }
      }, {
        id: 3,
        likelihood: 'binom',
        modelType: {
          type: 'node-split',
          details: {
            from: {
              id: 2
            },
            to: {
              id: 3
            }
          }
        },
        taskId: 101
      }, {
        id: 4,
        likelihood: 'binom',
        modelType: {
          type: 'network'
        }
      }, {
        id: 5,
        likelihood: 'binom',
        modelType: {
          type: 'node-split',
          details: {
            from: {
              id: 1
            },
            to: {
              id: 2
            }
          }
        }
      }],
      modelDefer,
      modelMock = {
        id: 2
      },
      analysisDefer,
      analysisMock = {},
      problemMock,
      stateMock = jasmine.createSpyObj('$state', ['go']),
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', ['createNodeSplitOptions']),
      modelResourceMock = jasmine.createSpyObj('ModelResource', ['get', 'getResult']),
      nodesplitOverviewServiceMock = jasmine.createSpyObj('NodesplitOverviewService', ['buildConsistencyEstimates', 'buildDirectEffectEstimates', 'buildIndirectEffectEstimates']);

    beforeEach(module('gemtc.models'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;
      q = $q;

      modelDefer = q.defer();
      modelMock.$promise = modelDefer.promise;

      analysisDefer = q.defer();
      analysisMock.$promise = analysisDefer.promise;

      scope.model = modelMock;
      scope.analysis = analysisMock;

      modalMock.open.calls.reset();

      $controller('NodeSplitOverviewController', {
        $scope: scope,
        $q: q,
        $state: stateMock,
        $stateParams: stateParamsMock,
        $modal: modalMock,
        gemtcRootPath: '/',
        models: modelsMock,
        problem: problemMock,
        AnalysisService: analysisServiceMock,
        ModelResource: modelResourceMock,
        NodeSplitOverviewService: nodesplitOverviewServiceMock
      });

    }));

    describe('on creation', function() {
      it('goToModel should be on the scope & navigate when called', function() {
        var modelId = 101;

        expect(stateMock.go).not.toHaveBeenCalled();
        expect(scope.goToModel).toBeDefined();
        scope.goToModel(modelId);
        expect(stateMock.go).toHaveBeenCalledWith('model', {
          analysisId: stateParamsMock.analysisId,
          modelId: modelId
        });
      });
      it('openCreateNodeSplitDialog should be on the scope and call $modal.open', function() {
        expect(modalMock.open).not.toHaveBeenCalled();
        expect(scope.openCreateNodeSplitDialog).toBeDefined();
        scope.openCreateNodeSplitDialog();
        expect(modalMock.open).toHaveBeenCalled();
      });
      it('openCreateNetworkDialog should be on the scope and call $modal.open', function() {
        expect(modalMock.open).not.toHaveBeenCalled();
        expect(scope.openCreateNetworkDialog).toBeDefined();
        scope.openCreateNetworkDialog();
        expect(modalMock.open).toHaveBeenCalled();
      });
      it('should make networkModelResultsDefer available', function() {
        expect(scope.networkModelResultsDefer).toBeDefined();
      });
    });

    describe('when the scope.model resolves with a network model', function() {
      beforeEach(function() {
        modelMock.modelType = {
          type: 'network'
        };
        modelDefer.resolve(modelMock);
        scope.$apply();
      });
      it('scope.networkModel should be the model, and the newworkStateParams should be equal to the current ones', function() {
        expect(scope.networkModel).toBe(scope.model);
        expect(scope.networkStateParams).toBe(stateParamsMock);
      });
    });
    describe('when the scope.model resolves with a nodesplit model', function() {
      var optionsMock = [{
          label: 'comparison 1',
          from: {
            id: 1
          },
          to: {
            id: 2
          }
        }, {
          label: 'comparison 2',
          from: 'from 2',
          to: 'to 2'
        }, {
          label: 'comparison 1',
          from: {
            id: 2
          },
          to: {
            id: 3
          }
        }],
        directEffects = {},
        indirectEffects = {};

      beforeEach(function() {
        modelMock.modelType = {
          type: 'node-split'
        };
        modelMock.likelihood = 'binom';

        analysisMock.problem = {
          entries: []
        };
        var resultDefer = q.defer();
        var resultMock = {
          $promise: resultDefer.promise
        };

        modelDefer.resolve(modelMock);
        analysisDefer.resolve(analysisMock);
        resultDefer.resolve(resultMock);

        analysisServiceMock.createNodeSplitOptions.and.returnValue(optionsMock);
        modelResourceMock.getResult.and.returnValue(resultMock);
        nodesplitOverviewServiceMock.buildDirectEffectEstimates.and.returnValue(directEffects);
        nodesplitOverviewServiceMock.buildIndirectEffectEstimates.and.returnValue(indirectEffects);

        scope.$apply();
      });
      it('should build a row per nodesplit comparison, matching the model where possible', function() {
        expect(analysisServiceMock.createNodeSplitOptions).toHaveBeenCalledWith(problemMock);
        expect(scope.comparisons.length).toBe(optionsMock.length);
        var matchedComparisonNoResults = scope.comparisons[0];
        var unmatchedComparison = scope.comparisons[1];
        var matchedComparisonWithResult = scope.comparisons[2];
        expect(matchedComparisonNoResults.from).toBe(optionsMock[0].from);
        expect(matchedComparisonNoResults.to).toBe(optionsMock[0].to);
        expect(matchedComparisonNoResults.hasModel).toBeTruthy();
        expect(unmatchedComparison.hasModel).toBeFalsy();
        expect(matchedComparisonWithResult.hasModel).toBeTruthy();
        expect(matchedComparisonWithResult.hasResults).toBeTruthy();
        expect(matchedComparisonWithResult.directEffectEstimate).toBe(directEffects);
        expect(matchedComparisonWithResult.inDirectEffectEstimate).toBe(indirectEffects);
        expect(matchedComparisonWithResult.colSpan).toBe(1);
      });
      it('should find the matching network model', function() {
        expect(scope.networkModel).toBe(modelsMock[3]);
      });
      it('should retrieve results for models with a taskId', function() {
        expect(modelResourceMock.getResult).toHaveBeenCalledWith({
          modelId: modelsMock[2].id,
          analysisId: stateParamsMock.analysisId
        });
      });
      it('should set baseModelNotShown to false', function() {
        expect(scope.baseModelNotShown).toBeFalsy();
      });
    });

    describe('when the scope.model resolves with a nodesplit model that does not get selected from the models', function() {
      beforeEach(function() {
        modelMock.modelType = {
          type: 'node-split',
        };
        modelMock.likelihood = 'binom';
        modelMock.id = 5;

        analysisMock.problem = {
          entries: []
        };
        var resultDefer = q.defer();
        var resultMock = {
          $promise: resultDefer.promise
        };

        modelDefer.resolve(modelMock);
        analysisDefer.resolve(analysisMock);
        resultDefer.resolve(resultMock);
        scope.$apply();
      });

      it('baseModelNotShown should be true', function() {
        expect(scope.baseModelNotShown).toBeTruthy();
      })
    });

  });
});
