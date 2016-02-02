'use strict';
define(['angular', 'angular-mocks', 'services', 'constants'], function() {
  describe('the patavi service', function() {

    beforeEach(module('gemtc.constants'));

    beforeEach(function() {
      module('gemtc.services');
    });

    it('should make the run function available', inject(function($rootScope, $q, PataviService) {
      expect(PataviService.run).toBeDefined();
    }));
  });
});
