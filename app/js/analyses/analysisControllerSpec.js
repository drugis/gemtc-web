define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('the analysisController', function() {
    var scope, analysisResource, stateParamsMock;

    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;

      var analyisMock = 'analysisMock';
      stateParamsMock = {
        analyisId: -1
      }

      analysisResource = jasmine.createSpyObj('AnalysisResource', ['get']);
      analysisResource.get.and.returnValue(analyisMock);

      $controller('AnalysisController', {
        $scope: scope,
        $stateParams: stateParamsMock,
        AnalysisResource: analysisResource
      });
    }));

    describe('when first initialised', function() {
      it('should load the analyis', function() {
        expect(analysisResource.get).toHaveBeenCalledWith(stateParamsMock);
      });
    });

  });
});