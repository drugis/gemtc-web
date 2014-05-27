define(['angular', 'angular-mocks', 'services'], function() {
  describe('the patavi service', function() {

    var patavi;


    beforeEach(function() {
      var mockResults = {
        promise: 'foo'
      };
      var mockTask = {
        results: mockResults
      };

      patavi = jasmine.createSpyObj('patavi', ['submit']);
      patavi.submit.and.returnValue(mockTask);

      module('gemtc.services', function($provide) {
        $provide.value('gemtc-web/lib/patavi', patavi);
      });
    });

    it('should make the run function available', inject(function($rootScope, $q, PataviService) {
      var mockProblem = {
        entries: 'problem'
      };
      PataviService.run(mockProblem);
      expect(patavi.submit).toHaveBeenCalledWith('gemtc', mockProblem.entries);
    }));
  });
});