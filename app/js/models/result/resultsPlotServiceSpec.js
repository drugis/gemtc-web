'use strict';
define(['angular', 'angular-mocks', 'gemtc-web/services'], function (angular) {
  describe('the result plots service', function () {
    var resultsPlotsService;

    beforeEach(function () {
      angular.mock.module('gemtc.services');
    });

    beforeEach(inject(function (ResultsPlotService) {
      resultsPlotsService = ResultsPlotService;
    }));

    describe('prefixImageUris', function () {
      it('should add the resultplot prefix to each href', function () {
        var plotObj = {
          plot1: {
            href: 'test.jpg',
            otherProp: 'something'
          },
          plot2: {
            href: 'othertest.svg',
            someProp: 'itsathing'
          }
        };
        var prefix = 'https://patavi.org/tasks/32/results/';

        var expectedPlotObj = angular.copy(plotObj);
        expectedPlotObj.plot1.href = prefix + expectedPlotObj.plot1.href;
        expectedPlotObj.plot2.href = prefix + expectedPlotObj.plot2.href;

        expect(resultsPlotsService.prefixImageUris(plotObj, prefix)).toEqual(
          expectedPlotObj
        );
      });
    });
  });
});
