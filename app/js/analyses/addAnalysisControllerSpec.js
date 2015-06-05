define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('the add analysisController', function() {
    var scope, analysesResource, state, modalInstance, saveDefer, mockSaveResult;

    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;

      locationMock = jasmine.createSpyObj('location', ['url']);

      modalInstance = jasmine.createSpyObj('modalInstance', ['close', 'dismiss']);

      saveDefer = $q.defer();
      mockSaveResult = {id: -1};
      mockSaveResult.$promise = saveDefer.promise;
      analysesResource = jasmine.createSpyObj('AnalysesResource', ['save']);
      analysesResource.save.and.returnValue(mockSaveResult);

      $controller('AddAnalysisController', {
        $scope: scope,
        $location: locationMock,
        AnalysesResource: analysesResource,
        $modalInstance: modalInstance
      });
    }));

    describe('when first initialised', function() {
      it('should place addAnalysis on the scope', function() {
        expect(scope.addAnalysis).toBeDefined();
      });
      it('should place cancel on the scope', function() {
        expect(scope.cancel).toBeDefined();
      });
    });

    describe('when addAnalysis is called with a analysis', function() {

      var analysis;

      beforeEach(function(){
        analysis = {};
        scope.addAnalysis(analysis);
      });

      it('should save the analysis, close the modal and redirect to the analysis view', function() {
        expect(scope.isAddingAnalysis).toBe(true);
        expect(analysesResource.save).toHaveBeenCalledWith(analysis, jasmine.any(Function));
      });
    });

    describe('when cancel is called', function() {
      beforeEach(function(){
        scope.cancel();
      });
      it('should dismiss the modal', function() {
        expect(modalInstance.dismiss).toHaveBeenCalled();
      });
    });

  });
});