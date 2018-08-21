'use strict';
define(['angular', 'angular-mocks', 'gemtc-web/analyses/analyses'], function(angular) {
  describe('The networkplot service', function() {

    var networkPlotService;

    beforeEach(angular.mock.module('gemtc.analyses'));

    beforeEach(inject(function(NetworkPlotService) {
      networkPlotService = NetworkPlotService;
    }));

    //TODO : test drawNetwork
  });
});
