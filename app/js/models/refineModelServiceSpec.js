'use strict';
define(['angular', 'angular-mocks', 'services'], function() {
  describe('the model service', function() {

    var
      q,
      rootScope,
      refineModelService,
      modelMock = {
        title: 'foo',
        id: 13,
        link: 'odds ratio'
      },
      modelResourceMock = jasmine.createSpyObj('ModelResource', ['get']),
      modelServiceMock = jasmine.createSpyObj('ModelService', ['toFrontEnd']);

    beforeEach(function() {
      module('gemtc.models', function($provide) {
        $provide.value('ModelResource', modelResourceMock);
        $provide.value('ModelService', modelServiceMock);
      });
    });

    beforeEach(inject(function($q, $rootScope, RefineModelService) {
      q = $q;
      rootScope = $rootScope;

      var modelDefer = $q.defer();
      var getModelPromise = modelDefer.promise;
      modelDefer.resolve(modelMock);
      modelResourceMock.get.and.returnValue({
        $promise: getModelPromise
      });

      modelServiceMock.toFrontEnd.and.returnValue({
        label: 'its a thing'
      });

      refineModelService = RefineModelService;
    }));

    describe('getRefinedModel', function() {

      beforeEach(function() {
        refineModelService.getRefinedModel(1, 2);
        rootScope.$apply();
      });

      it('should get the model and call modelservice.toFrontEnd', function() {
        expect(modelResourceMock.get).toHaveBeenCalled();
        expect(modelServiceMock.toFrontEnd).toHaveBeenCalledWith({link: 'odds ratio'});
      });

    });
  });
});
