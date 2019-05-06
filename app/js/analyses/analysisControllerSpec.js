'use strict';
define(['angular', 'angular-mocks', 'gemtc-web/analyses/analyses'], function(angular) {
  describe('the analysisController', function() {
    var scope;
    var analysisResource;
    var stateParamsMock;
    var modalMock;

    beforeEach(angular.mock.module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope;
      scope.$parent = {};
      stateParamsMock = {
        analyisId: -1
      };
      modalMock = {};
      analysisResource = jasmine.createSpyObj('AnalysisResource', ['get']);
      var analyisMock = 'analysisMock';
      analysisResource.get.and.returnValue(analyisMock);

      $controller('AnalysisController', {
        $scope: scope,
        $stateParams: stateParamsMock,
        $modal: modalMock,
        AnalysisResource: analysisResource
      });
    }));

    describe('when first initialised', function() {
      it('should load the analyis', function() {
        expect(analysisResource.get).toHaveBeenCalled();
      });

      it('should put the edit title function on the scope', () => {
        expect(scope.editAnalysisTitle).toBeDefined();
      });
    });
  });
});
