'use strict';
define(['angular', 'angular-mocks', 'gemtc-web/analyses/analyses'], function(angular) {
  describe('the analysisController', function() {
    var scope, analysisResource, stateParamsMock, networkPlotService;

    beforeEach(angular.mock.module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope;

      // we all have one
      scope.$parent = {};

      var analyisMock = 'analysisMock';
      stateParamsMock = {
        analyisId: -1
      };
      networkPlotService = jasmine.createSpyObj('NetworkPlotService', ['bla']);

      analysisResource = jasmine.createSpyObj('AnalysisResource', ['get']);
      analysisResource.get.and.returnValue(analyisMock);

      $controller('AnalysisController', {
        $scope: scope,
        $stateParams: stateParamsMock,
        AnalysisResource: analysisResource,
        NetworkPlotService: networkPlotService
      });
    }));

    describe('when first initialised', function() {
      it('should load the analyis', function() {
        expect(analysisResource.get).toHaveBeenCalled();

      });
    });

  });
});
