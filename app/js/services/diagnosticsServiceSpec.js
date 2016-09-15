'use strict';
define(['angular', 'angular-mocks', 'services'], function() {
  describe('the diagnostics service', function() {

    var diagnosticsService;

    beforeEach(function() {
      module('gemtc.services');
    });

    beforeEach(inject(function(DiagnosticsService) {
      diagnosticsService = DiagnosticsService;
    }));

    describe('buildDiagnosticMap', function() {
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
          },
          'd.direct': {
            'Point est.': 1.0009,
            'Upper C.I.': 1.0013
          },
          'beta[2]': {
            'Point est.': 1.1234,
            'Upper C.I.': 1.5678
          }
        };

        var expected = {
          'd.2.3 (Fluoxetine, Paroxetine)': {
            key: 'd.2.3',
            label: 'd.2.3 (Fluoxetine, Paroxetine)',
            'Point est.': 1.0004,
            'Upper C.I.': 1.0011,
            tracePlot: 'a',
            densityPlot: 'b',
            psrfPlot: 'a'
          },
          'd.2.4 (Fluoxetine, Venlafaxine)': {
            key: 'd.2.4',
            label: 'd.2.4 (Fluoxetine, Venlafaxine)',
            'Point est.': 1.0005,
            'Upper C.I.': 1.0017,
            tracePlot: 'c',
            densityPlot: 'd',
            psrfPlot: 'b'
          },
          'd.2.5 (Fluoxetine, Sertraline)': {
            key: 'd.2.5',
            label: 'd.2.5 (Fluoxetine, Sertraline)',
            'Point est.': 1.0002,
            'Upper C.I.': 1.0005,
            tracePlot: 'e',
            densityPlot: 'f',
            psrfPlot: 'c'
          },
          'sd.d (Random effects standard deviation)': {
            key: 'sd.d',
            label: 'sd.d (Random effects standard deviation)',
            'Point est.': 1.0007,
            'Upper C.I.': 1.0011,
            tracePlot: 'g',
            densityPlot: 'h',
            psrfPlot: 'd'
          },
          'd.indirect (Indirect estimate)': {
            key: 'd.indirect',
            label: 'd.indirect (Indirect estimate)',
            'Point est.': 1.0008,
            'Upper C.I.': 1.0012,
            tracePlot: 'i',
            densityPlot: 'j',
            psrfPlot: 'e'
          },
          'd.direct (Direct estimate)': {
            key: 'd.direct',
            label: 'd.direct (Direct estimate)',
            'Point est.': 1.0009,
            'Upper C.I.': 1.0013,
            tracePlot: 'k',
            densityPlot: 'l',
            psrfPlot: 'f'
          },
          'beta (Paroxetine)': {
            key: 'beta[2]',
            label: 'beta (Paroxetine)',
            'Point est.': 1.1234,
            'Upper C.I.': 1.5678,
            tracePlot: undefined,
            densityPlot: undefined,
            psrfPlot: undefined
          }
        };
        var model = {
          modelType: {
            type: 'network'
          }
        };
        var tracePlots = {
          'd.2.3': 'a',
          'd.2.4': 'c',
          'd.2.5': 'e',
          'sd.d': 'g',
          'd.indirect': 'i',
          'd.direct': 'k'
        };
        var densityPlots = {
          'd.2.3': 'b',
          'd.2.4': 'd',
          'd.2.5': 'f',
          'sd.d': 'h',
          'd.indirect': 'j',
          'd.direct': 'l'
        };
        var psrfPlots = {
          'd.2.3': 'a',
          'd.2.4': 'b',
          'd.2.5': 'c',
          'sd.d': 'd',
          'd.indirect': 'e',
          'd.direct': 'f'
        };
        var result = {
          gelmanDiagnostics: gelmanDiagnostics,
          convergencePlots: {
            trace: tracePlots,
            density: densityPlots,
            psrf: psrfPlots
          }
        };

        var problem = {
          treatments: treatments
        };

        var map = diagnosticsService.buildDiagnosticMap(model, problem, result);
        expect(map).toEqual(expected);

      });

    });

    describe('compareDiagnostics', function() {
      it('should place sd.d at the rear', function() {
        var a = {
          key: 'sd.d'
        };
        var b = {
          key: 'zedzedzed'
        };
        expect(diagnosticsService.compareDiagnostics(a, b)).toBe(1);
        expect(diagnosticsService.compareDiagnostics(b, a)).toBe(-1);
      });
      describe('when comparing d.x.y pairs', function() {
        it('should sort first by x', function() {
          var a = {
            key: 'd.12.3'
          };
          var b = {
            key: 'd.1.3'
          };
          expect(diagnosticsService.compareDiagnostics(a, b) > 0).toBe(true);
          expect(diagnosticsService.compareDiagnostics(b, a) < 0).toBe(true);
        });
        it('should sort second by y', function() {
          var a = {
            key: 'd.1.23'
          };
          var b = {
            key: 'd.1.3'
          };
          expect(diagnosticsService.compareDiagnostics(a, b) > 0).toBe(true);
          expect(diagnosticsService.compareDiagnostics(b, a) < 0).toBe(true);
        });
      });
      describe('when comparing beta[x] strings', function() {
        it('beta should go behind d.x.y', function() {
          var a = {
            key: 'd.1.23'
          };
          var b = {
            key: 'beta[3]'
          };
          expect(diagnosticsService.compareDiagnostics(a, b) < 0).toBe(true);
          expect(diagnosticsService.compareDiagnostics(b, a) > 0).toBe(true);
        });
        it('betas should be sorted numerically', function() {
          var a = {
            key: 'beta[3]'
          };
          var b = {
            key: 'beta[30]'
          };
          expect(diagnosticsService.compareDiagnostics(a, b) < 0).toBe(true);
          expect(diagnosticsService.compareDiagnostics(b, a) > 0).toBe(true);
        });
      });
    });

  });
});
