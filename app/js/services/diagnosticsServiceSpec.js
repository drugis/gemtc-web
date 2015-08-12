define(['angular', 'angular-mocks', 'services'], function() {
  describe('the diagnostics service', function() {

    var diagnosticsService;

    beforeEach(function() {
      module('gemtc.services');
    });

    beforeEach(inject(function(DiagnosticsService) {
      diagnosticsService = DiagnosticsService;
    }));

    describe('labelDiagnostics', function() {


      it('should correctly label the parameters', function() {
        var treatments = [{
          id: 2,
          name: 'Fluoxetine'
        }, {
          id: 3,
          name: 'Paroxetine'
        }, {
          id: 4,
          name: 'Venlafaxine'
        }, {
          id: 5,
          name: 'Sertraline'
        }];
        var gelmanDiagnostics = {
          'd.2.3': {
            'Point est.': 1.0004,
            'Upper C.I.': 1.0011
          },
          'd.2.4': {
            'Point est.': 1.0005,
            'Upper C.I.': 1.0017
          },
          'd.2.5': {
            'Point est.': 1.0002,
            'Upper C.I.': 1.0005
          },
          'deviance': {
            'Point est.': 1.0002,
            'Upper C.I.': 1.0005
          },
          'sd.d': {
            'Point est.': 1.0007,
            'Upper C.I.': 1.0011
          },
          'd.indirect': {
            'Point est.': 1.0008,
            'Upper C.I.': 1.0012
          }
        };

        var expected = [{
          key: 'd.2.3',
          label: 'd.2.3 (Fluoxetine, Paroxetine)',
          'Point est.': 1.0004,
          'Upper C.I.': 1.0011
        }, {
          key: 'd.2.4',
          label: 'd.2.4 (Fluoxetine, Venlafaxine)',
          'Point est.': 1.0005,
          'Upper C.I.': 1.0017
        }, {
          key: 'd.2.5',
          label: 'd.2.5 (Fluoxetine, Sertraline)',
          'Point est.': 1.0002,
          'Upper C.I.': 1.0005
        }, {
          key: 'sd.d',
          label: 'sd.d (Random effects standard deviation)',
          'Point est.': 1.0007,
          'Upper C.I.': 1.0011
        }, {
          key: 'd.indirect',
          label: 'd.indirect (Indirect estimate)',
          'Point est.': 1.0008,
          'Upper C.I.': 1.0012
        }];
        var labeledDiagnostics = diagnosticsService.labelDiagnostics(gelmanDiagnostics, treatments);
        expect(labeledDiagnostics).toEqual(expected);

      });
    });

  });
});