define(['angular', 'angular-mocks', 'models/models'], function() {
  fdescribe('the nodesplit overview controller', function() {
    var scope,
      q,
      stateParamsMock = {
        analysisId: 3,
        modelId: 2
      },
      modalMock = jasmine.createSpyObj('$modal', ['open']),
      modelsMock,
      modelDefer,
      modelMock = {},
      problemMock,
      stateMock = jasmine.createSpyObj('$state', ['go']),
      analysisServiceMock = jasmine.createSpyObj('AnalysisService', ['doSomethjing']),
      modelResourceMock = jasmine.createSpyObj('ModelResource', ['get', 'getResult']),
      nodesplitOverviewServiceMock = jasmine.createSpyObj('NodesplitOverviewService', ['doSomething']);

    beforeEach(module('gemtc.models'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;
      q = $q;

      modelDefer = q.defer();
      modelMock.$promise = modelDefer.promise;

      scope.model = modelMock;

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
        NodesplitOverviewService: nodesplitOverviewServiceMock
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
    });
  });
});
