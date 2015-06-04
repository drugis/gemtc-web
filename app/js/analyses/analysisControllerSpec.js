define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('the analysisController', function() {
    var scope, analysesResource, stateParamsMock;

    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;

      var analyisMock = 'analyisMock';
      stateParamsMock = {
        analyisId: -1
      }

      analysesResource = jasmine.createSpyObj('AnalysesResource', ['get']);
      analysesResource.get.and.returnValue(analyisMock);

      $controller('AnalysisController', {
        $scope: scope,
        $stateParams: stateParamsMock,
        AnalysesResource: analysesResource
      });
    }));

    describe('when first initialised', function() {
      it('should load the analyis', function() {
        expect(analysesResource.get).toHaveBeenCalledWith(stateParamsMock);
      });
    });

  });
});