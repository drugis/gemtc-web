define(['angular', 'angular-mocks', 'services'], function() {
  describe('the deviance statistics service', function() {
    beforeEach(module('gemtc.models'));

    var devianceStatisticsService;
    beforeEach(inject(function(DevianceStatisticsService) {
      devianceStatisticsService = DevianceStatisticsService;
    }));
    describe('buildTable function', function() {
      it('should create one row per study arm', function() {
        var testProblem = {
          'entries': [{
            'study': 'Rudolph and Feiger, 1999',
            'treatment': 4,
            'responders': 58,
            'sampleSize': 100
          }, {
            'study': 'Rudolph and Feiger, 1999',
            'treatment': 2,
            'responders': 53,
            'sampleSize': 103
          }, {
            'study': 'De Wilde et al, 1993',
            'treatment': 3,
            'responders': 24,
            'sampleSize': 37
          }, {
            'study': 'De Wilde et al, 1993',
            'treatment': 2,
            'responders': 25,
            'sampleSize': 41
          }, {
            'study': 'Schone and Ludwig, 1993',
            'treatment': 2,
            'responders': 9,
            'sampleSize': 52
          }, {
            'study': 'Schone and Ludwig, 1993',
            'treatment': 3,
            'responders': 21,
            'sampleSize': 54
          }, {
            'study': 'Aberg-Wistedt et al, 2000',
            'treatment': 3,
            'responders': 158,
            'sampleSize': 177
          }, {
            'study': 'Aberg-Wistedt et al, 2000',
            'treatment': 5,
            'responders': 157,
            'sampleSize': 176
          }, {
            'study': 'Alves et al, 1999',
            'treatment': 2,
            'responders': 26,
            'sampleSize': 47
          }, {
            'study': 'Alves et al, 1999',
            'treatment': 4,
            'responders': 32,
            'sampleSize': 40
          }, {
            'study': 'Ballus et al, 2000',
            'treatment': 3,
            'responders': 27,
            'sampleSize': 43
          }, {
            'study': 'Ballus et al, 2000',
            'treatment': 4,
            'responders': 26,
            'sampleSize': 41
          }, {
            'study': 'Boyer et al, 1998',
            'treatment': 2,
            'responders': 61,
            'sampleSize': 120
          }, {
            'study': 'Boyer et al, 1998',
            'treatment': 5,
            'responders': 63,
            'sampleSize': 122
          }],
          'treatments': [{
            'id': 2,
            'name': 'Fluoxetine',
            '$$hashKey': 'object:41'
          }, {
            'id': 3,
            'name': 'Paroxetine',
            '$$hashKey': 'object:42'
          }, {
            'id': 4,
            'name': 'Venlafaxine',
            '$$hashKey': 'object:43'
          }, {
            'id': 5,
            'name': 'Sertraline',
            '$$hashKey': 'object:44'
          }]
        };
        var testStatistics = {
          'perArmDeviance': {
            'Aberg-Wistedt et al, 2000': {
              '4': 1.0394,
              '2': 0.96493
            },
            'Alves et al, 1999': {
              '3': 1.1449,
              '2': 1.1109
            },
            'Ballus et al, 2000': {
              '2': 0.84224,
              '3': 0.83916
            },
            'Boyer et al, 1998': {
              '3': 0.96935,
              '5': 0.99498
            },
            'De Wilde et al, 1993': {
              '2': 0.87197,
              '4': 0.89354
            },
            'Rudolph and Feiger, 1999': {
              '3': 1.0073,
              '4': 1.0298
            },
            'Schone and Ludwig, 1993': {
              '2': 1.1787,
              '5': 1.1817
            }
          },
          'perArmLeverage': {
            'Aberg-Wistedt et al, 2000': {
              '2': 0.073178,
              '4': 0.070573
            },
            'Alves et al, 1999': {
              '2': 0.37087,
              '3': 0.23763
            },
            'Ballus et al, 2000': {
              '2': 0.0034346,
              '3': 0.0007348
            },
            'Boyer et al, 1998': {
              '3': 0.040671,
              '5': 0.034708
            },
            'De Wilde et al, 1993': {
              '2': 0.060583,
              '4': 0.086399
            },
            'Rudolph and Feiger, 1999': {
              '3': 0.09557,
              '4': 0.094392
            },
            'Schone and Ludwig, 1993': {
              '2': 0.41097,
              '5': 0.25911
            }
          }
        }
        var result = devianceStatisticsService.buildTable(testStatistics, testProblem);
        expect(result.length).toBe(testProblem.entries.length);
        if (result[1].armName === 'Fluoxetine') {
          expect(result[1].studyName).toBe('Aberg-Wistedt et al, 2000');
          expect(result[1].armName).toBe('Fluoxetine');
          expect(result[1].deviance).toBe(testStatistics.perArmDeviance['Aberg-Wistedt et al, 2000'][2]);
          expect(result[1].leverage).toBe(testStatistics.perArmLeverage['Aberg-Wistedt et al, 2000'][2]);

        } else {
          expect(result[0].studyName).toBe('Aberg-Wistedt et al, 2000');
          expect(result[0].armName).toBe('Fluoxetine');
          expect(result[0].deviance).toBe(testStatistics.perArmDeviance['Aberg-Wistedt et al, 2000'][2]);
          expect(result[0].leverage).toBe(testStatistics.perArmLeverage['Aberg-Wistedt et al, 2000'][2]);

        }
        expect(result[0].rowSpan).toBe(2);
        expect(result[1].rowSpan).not.toBeDefined();
      });
    });
  });
});