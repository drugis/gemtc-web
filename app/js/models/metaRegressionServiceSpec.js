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

      it('should combine the plots with the treatmentNames and sort te result by treatmentName', function() {
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


        var covariatePlotOptions = metaRegressionService.buildCovariatePlotOptions(result, problem);
        expect(covariatePlotOptions).toEqual(expected);

      });

    });

  });
});