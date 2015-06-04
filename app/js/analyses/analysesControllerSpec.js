define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('the analysesController', function() {
    var scope, analysesResource, stateParamsMock, modal;

    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;

      var analyesMock = ['analyisMock'];
      stateParamsMock = {
        analyisId: -1
      }

      modal = jasmine.createSpyObj('modal', ['open']);

      analysesResource = jasmine.createSpyObj('AnalysesResource', ['query']);
      analysesResource.query.and.returnValue(analyesMock);

      $controller('AnalysesController', {
        $scope: scope,
        $modal: modal,
        AnalysesResource: analysesResource
      });
    }));

    describe('when first initialised', function() {
      it('should set analysesLoaded to false', function() {
        expect(scope.analysesLoaded).toBeFalse;
      });

      it('should load the analyes', function() {
        expect(analysesResource.query).toHaveBeenCalled();
      });

      it('should place createDatasetDialog on the scope', function() {
        expect(scope.createDatasetDialog).toBeDefined();
      });

      it('should place isAddButtonDisabled on the scope', function() {
        expect(scope.createDatasetDialog).toBeDefined();
      });
    });

    describe('when createDatasetDialog isCalled', function() {
      beforeEach(function(){
        scope.createDatasetDialog();
      })
      it('should open the dialog', function() {
        expect(modal.open).toHaveBeenCalled();
      });
    });

    describe('when isAddButtonDisabled isCalled', function() {
      it('with no analysis it should return true', function() {
        expect(scope.isAddButtonDisabled).toBeTrue;
      });

      it('with a analysis without a title it should return true', function() {
        expect(scope.isAddButtonDisabled({})).toBeTrue;
      });

      it('with a analysis without a outcome it should return true', function() {
        expect(scope.isAddButtonDisabled({title: 'title'})).toBeTrue;
      });

      it('with a analysis without a problem it should return true', function() {
        expect(scope.isAddButtonDisabled({title: 'title', outcome: 'outcome'}))
        .toBeTrue;
      });

      it('with a analysis while busy adding a anlaysis should return true', function() {
        scope.isAddingAnalysis = true;
        expect(scope.isAddButtonDisabled({title: 'title', outcome: 'outcome', problem: 'problem'}))
        .toBeTrue;
      });

      it('with a analysis while not busy adding a anlaysis should return true', function() {
        expect(scope.isAddButtonDisabled({title: 'title', outcome: 'outcome', problem: 'problem'}))
        .toBeFalse;
      });
    });

  });
});