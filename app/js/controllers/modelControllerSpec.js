define(['angular', 'angular-mocks', 'controllers'], function() {
  describe('the modelController', function() {
    var scope, modelResource, mockStateParams = {
        analysisId: 1,
        projectId: 11
      },
      modelDeferred,
      mockModel;

    beforeEach(module('gemtc.controllers'));

    beforeEach(inject(function($rootScope, $controller, $q) {
      scope = $rootScope;
      modelDeferred = $q.defer();
      mockModel = {
        $promise: modelDeferred.promise
      };
      modelResource = jasmine.createSpyObj('ModelResource', ['get']);
      modelResource.get.and.returnValue(mockModel);
      $controller('ModelController', {
        $scope: scope,
        $stateParams: mockStateParams,
        ModelResource: modelResource
      });
    }));

    describe('when first initialised', function() {
      it('should attempt to load the model', function() {
        expect(modelResource.get).toHaveBeenCalledWith(mockStateParams);
      });

      it('should place the model on the scope', function() {
        expect(scope.model).toBeTruthy();
      });
    });

  });
});