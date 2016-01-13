define(['angular', 'angular-mocks', 'analyses/analyses', 'models/models'], function() {
  describe('the add analysisController', function() {
    var scope, analysisResource, state, modalInstance,
      saveDefer, mockSaveResult,
      problemValidityService, csvParseService, fileUploadService;

    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;

      locationMock = jasmine.createSpyObj('location', ['url']);

      modalInstance = jasmine.createSpyObj('modalInstance', ['close', 'dismiss']);

      saveDefer = $q.defer();
      mockSaveResult = {
        id: -1
      };
      mockSaveResult.$promise = saveDefer.promise;
      analysisResource = jasmine.createSpyObj('AnalysisResource', ['save']);
      analysisResource.save.and.returnValue(mockSaveResult);

      problemValidityService = jasmine.createSpyObj('problemValidityService', ['getValidity']);
      csvParseService = jasmine.createSpyObj('csvParseService', ['parse']);
      fileUploadService = jasmine.createSpyObj('fileUploadService', ['processFile']);

      $controller('AddAnalysisController', {
        $scope: scope,
        $location: locationMock,
        AnalysisResource: analysisResource,
        $modalInstance: modalInstance,
        ProblemValidityService: problemValidityService,
        CSVParseService: csvParseService,
        FileUploadService: fileUploadService
      });
    }));

    describe('when first initialised', function() {
      it('should place addAnalysis on the scope', function() {
        expect(scope.addAnalysis).toBeDefined();
      });
      it('should place cancel on the scope', function() {
        expect(scope.cancel).toBeDefined();
      });
      it('should place isAddButtonDisabled on the scope', function() {
        expect(scope.isAddButtonDisabled).toBeDefined();
      });
    });

    describe('when addAnalysis is called with a analysis', function() {

      var analysis;

      beforeEach(function() {
        analysis = {};
        scope.addAnalysis(analysis);
      });

      it('should save the analysis, close the modal and redirect to the analysis view', function() {
        expect(scope.isAddingAnalysis).toBe(true);
        expect(analysisResource.save).toHaveBeenCalledWith(analysis, jasmine.any(Function));
      });
    });

    describe('when cancel is called', function() {
      beforeEach(function() {
        scope.cancel();
      });
      it('should dismiss the modal', function() {
        expect(modalInstance.dismiss).toHaveBeenCalled();
      });
    });

    describe('when isAddButtonDisabled isCalled', function() {
      it('with no analysis it should return true', function() {
        expect(scope.isAddButtonDisabled(null)).toBe(true);
      });

      it('with a analysis without a title it should return true', function() {
        expect(scope.isAddButtonDisabled({})).toBe(true);
      });

      it('with a analysis without a outcome it should return true', function() {
        expect(scope.isAddButtonDisabled({
          title: 'title',
          outcome: {}
        })).toBe(true);
      });

      it('with a analysis without a problem it should return true', function() {
        expect(scope.isAddButtonDisabled({
            title: 'title',
            outcome: {
              name: 'outcome'
            },
          }))
          .toBe(true);
      });

      it('with a analysis while busy adding a analysis should return true', function() {
        scope.isAddingAnalysis = true;
        expect(scope.isAddButtonDisabled({
            title: 'title',
            outcome: {
              name: 'outcome'
            },
            problem: 'problem'
          }))
          .toBe(true);
      });

      it('with a analysis while not busy adding a analysis should return true', function() {
        expect(scope.isAddButtonDisabled({
            title: 'title',
            outcome: {
              name: 'outcome'
            },
            problem: 'problem'
          }))
          .toBeFalsy();
      });
    });

  });
});
