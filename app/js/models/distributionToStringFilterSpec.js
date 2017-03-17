'use strict';
define(['angular', 'angular-mocks'], function() {
  describe('The distribution to string filter', function() {
    var distributionToStringFilter;
    var measurementMomentService;

    beforeEach(module('gemtc.models'));

    beforeEach(inject(function($filter) {
      distributionToStringFilter = $filter('distributionToStringFilter');
    }));

    it('should not break if the distribution is undefined', function() {
      expect(distributionToStringFilter(undefined)).toEqual(undefined);
    });

    it('should render a β distribution', function() {
      var betaDistribution = {
        alpha: 64,
        beta: 60,
        name: 'Sertraline',
        scale: 'log odds',
        type: 'dbeta-logit'
      };
      var expectedResult = 'log odds (Sertraline) ~ Beta(64, 60)';
      var result = distributionToStringFilter(betaDistribution);
      expect(result).toBe(expectedResult);
    });

    it('should render a normal distribution', function(){
      var normalDistribution = {
        mu: 64,
        sigma: 1.5,
        name: 'Sertraline',
        scale: 'mean',
        type: 'dnorm'
      };
      var expectedResult = 'mean (Sertraline) ~ N(64, 1.5)';
      var result = distributionToStringFilter(normalDistribution);
      expect(result).toBe(expectedResult);
    });
  });
});
