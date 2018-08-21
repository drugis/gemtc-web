'use strict';
define(['angular', 'angular-mocks', 'gemtc-web/analyses/analyses'], function(angular) {
  describe('the analysesController', function() {
    var scope, analysisResource , modal;

    beforeEach(angular.mock.module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope;

      var analysesMock = ['analysisMock'];

      modal = jasmine.createSpyObj('modal', ['open']);

      analysisResource = jasmine.createSpyObj('AnalysisResource', ['query']);
      analysisResource.query.and.returnValue(analysesMock);

      $controller('AnalysesController', {
        $scope: scope,
        $modal: modal,
        AnalysisResource: analysisResource
      });
    }));

    describe('when first initialised', function() {
      it('should set analysesLoaded to false', function() {
        expect(scope.analysesLoaded).toBe(false);
      });

      it('should load the analyes', function() {
        expect(analysisResource.query).toHaveBeenCalled();
      });

      it('should place createAnalysisDialog on the scope', function() {
        expect(scope.createAnalysisDialog).toBeDefined();
      });
    });

    describe('when createAnalysisDialog isCalled', function() {
      beforeEach(function(){
        scope.createAnalysisDialog();
      });
      it('should open the dialog', function() {
        expect(modal.open).toHaveBeenCalled();
      });
    });

  });
});
