define(['angular', 'angular-mocks', 'services', 'constants'], function() {
  describe('the patavi service', function() {

    beforeEach(module('gemtc.constants'));

    beforeEach(function() {
      var mockResults = {
        promise: 'foo'
      };
      var mockTask = {
        results: mockResults
      };

      module('gemtc.services', function($provide) {
      });
    });

    it('should make the run function available', inject(function($rootScope, $q, PataviService) {
      expect(PataviService.run).toBeDefined();
    }));
  });
});