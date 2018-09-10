'use strict';
define(['angular', 'angular-mocks', 'gemtc-web/analyses/analyses'], function(angular) {
  describe('the analysesController', function() {
    var scope, analysisResourceMock, modal, pageTitleServiceMock;

    beforeEach(angular.mock.module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope;

      var analysesMock = ['analysisMock'];

      modal = jasmine.createSpyObj('modal', ['open']);

      analysisResourceMock = jasmine.createSpyObj('AnalysisResource', ['query']);
      analysisResourceMock.query.and.returnValue(analysesMock);
      pageTitleServiceMock = jasmine.createSpyObj('PageTitleService', ['setPageTitle']);

      $controller('AnalysesController', {
        $scope: scope,
        $modal: modal,
        AnalysisResource: analysisResourceMock,
        PageTitleService: pageTitleServiceMock
      });
    }));

    describe('when first initialised', function() {
      it('should set analysesLoaded to false', function() {
        expect(scope.analysesLoaded).toBe(false);
      });

      it('should load the analyes', function() {
        expect(analysisResourceMock.query).toHaveBeenCalled();
      });

      it('should place createAnalysisDialog on the scope', function() {
        expect(scope.createAnalysisDialog).toBeDefined();
      });
    });

    describe('when createAnalysisDialog isCalled', function() {
      beforeEach(function() {
        scope.createAnalysisDialog();
      });
      it('should open the dialog', function() {
        expect(modal.open).toHaveBeenCalled();
      });
    });

  });
});
