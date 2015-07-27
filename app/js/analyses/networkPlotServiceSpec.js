define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('The networkplot service', function() {

    var networkPlotService;

    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function(NetworkPlotService) {
      networkPlotService = NetworkPlotService;
    }));

    //TODO : test drawNetwork
  });
});
