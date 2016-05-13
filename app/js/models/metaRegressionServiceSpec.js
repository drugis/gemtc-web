'use strict';
define(['angular', 'angular-mocks', 'services'], function() {
  describe('the meta-regression service', function() {

    var metaRegressionService;

    beforeEach(function() {
      module('gemtc.services');
    });

    beforeEach(inject(function(MetaRegressionService) {
      metaRegressionService = MetaRegressionService;
    }));

    describe('buildCovariatePlotOptions', function() {

      it('should combine the plots with the treatmentNames and sort the result by treatmentName', function() {
        var treatments = [{
          id: 2,
          name: 'Fluoxetine'
        }, {
          id: 5,
          name: 'Paroxetine'
        }, {
          id: 4,
          name: 'Venlafaxine'
        }, {
          id: 3,
          name: 'Sertraline'
        }];
        var result = {
          results: {
            covariateEffectPlot: {
              3: '3',
              2: '2',
              5: '5',
            }
          }
        };
        var problem = {
          treatments: treatments
        };
        var expected = [{
          treatmentName: 'Fluoxetine',
          plot: '2'
        }, {
          treatmentName: 'Paroxetine',
          plot: '5'
        }, {
          treatmentName: 'Sertraline',
          plot: '3'
        }];


        var covariatePlotOptions = metaRegressionService.buildCovariatePlotOptions(result.results, problem);
        expect(covariatePlotOptions).toEqual(expected);

      });

    });

    describe('getCovariateSummaries', function() {
      it('should get the beta summaries', function() {

        var treatments = [{
          id: 2,
          name: 'Fluoxetine'
        }, {
          id: 5,
          name: 'Paroxetine'
        }, {
          id: 4,
          name: 'Venlafaxine'
        }, {
          id: 3,
          name: 'Sertraline'
        }];
        var result = {
          results: {
            summaries: {
              quantiles: {
                'd.2.3': {},
                'd.2.4': {},
                'd.2.5': {},
                'sd.d': {},
                'B': {
                  something: 'something'
                }
              }
            }
          }
        };
        var problem = {
          treatments: treatments
        };
        var expected = [{
          key: 'B',
          label: 'beta (covariate)',
          value: {
            something: 'something'
          }
        }];

        var covariateSummaries = metaRegressionService.getCovariateSummaries(result.results, problem);
        expect(covariateSummaries).toEqual(expected);
      });
    });

  });
});
