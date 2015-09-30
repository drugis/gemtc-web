define(['angular', 'angular-mocks', 'services'], function() {
  describe('the deviance statistics service', function() {
    beforeEach(module('gemtc.models'));

    var devianceStatisticsService;
    beforeEach(inject(function(DevianceStatisticsService) {
      devianceStatisticsService = DevianceStatisticsService;
    }));
    fdescribe('buildTable function', function() {
      it('should create one row per study arm', function() {
        var testProblem = {
          "entries": [{
            "study": "Rudolph and Feiger, 1999",
            "treatment": 4,
            "responders": 58,
            "sampleSize": 100
          }, {
            "study": "Rudolph and Feiger, 1999",
            "treatment": 2,
            "responders": 53,
            "sampleSize": 103
          }, {
            "study": "De Wilde et al, 1993",
            "treatment": 3,
            "responders": 24,
            "sampleSize": 37
          }, {
            "study": "De Wilde et al, 1993",
            "treatment": 2,
            "responders": 25,
            "sampleSize": 41
          }, {
            "study": "Schone and Ludwig, 1993",
            "treatment": 2,
            "responders": 9,
            "sampleSize": 52
          }, {
            "study": "Schone and Ludwig, 1993",
            "treatment": 3,
            "responders": 21,
            "sampleSize": 54
          }, {
            "study": "Aberg-Wistedt et al, 2000",
            "treatment": 3,
            "responders": 158,
            "sampleSize": 177
          }, {
            "study": "Aberg-Wistedt et al, 2000",
            "treatment": 5,
            "responders": 157,
            "sampleSize": 176
          }, {
            "study": "Alves et al, 1999",
            "treatment": 2,
            "responders": 26,
            "sampleSize": 47
          }, {
            "study": "Alves et al, 1999",
            "treatment": 4,
            "responders": 32,
            "sampleSize": 40
          }, {
            "study": "Ballus et al, 2000",
            "treatment": 3,
            "responders": 27,
            "sampleSize": 43
          }, {
            "study": "Ballus et al, 2000",
            "treatment": 4,
            "responders": 26,
            "sampleSize": 41
          }, {
            "study": "Boyer et al, 1998",
            "treatment": 2,
            "responders": 61,
            "sampleSize": 120
          }, {
            "study": "Boyer et al, 1998",
            "treatment": 5,
            "responders": 63,
            "sampleSize": 122
          }],
          "treatments": [{
            "id": 2,
            "name": "Fluoxetine",
            "$$hashKey": "object:41"
          }, {
            "id": 3,
            "name": "Paroxetine",
            "$$hashKey": "object:42"
          }, {
            "id": 4,
            "name": "Venlafaxine",
            "$$hashKey": "object:43"
          }, {
            "id": 5,
            "name": "Sertraline",
            "$$hashKey": "object:44"
          }]
        };
        var testStatistics = {
          "perArmDeviance": {
            "Aberg-Wistedt et al, 2000": [1.0394, 0.96493],
            "Alves et al, 1999": [1.1449, 1.1109],
            "Ballus et al, 2000": [0.84224, 0.83916],
            "Boyer et al, 1998": [0.96935, 0.99498],
            "De Wilde et al, 1993": [0.87197, 0.89354],
            "Rudolph and Feiger, 1999": [1.0073, 1.0298],
            "Schone and Ludwig, 1993": [1.1787, 1.1817]
          },
          "perArmLeverage": {
            "Aberg-Wistedt et al, 2000": [0.070573, 0.073178],
            "Alves et al, 1999": [0.23763, 0.37087],
            "Ballus et al, 2000": [0.0034346, 0.0007348],
            "Boyer et al, 1998": [0.040671, 0.034708],
            "De Wilde et al, 1993": [0.060583, 0.086399],
            "Rudolph and Feiger, 1999": [0.09557, 0.094392],
            "Schone and Ludwig, 1993": [0.41097, 0.25911]
          }
        }
        var result = devianceStatisticsService.buildTable(testStatistics, testProblem);
        expect(result.length).toBe(testProblem.entries.length);
        expect(result[0].studyName).toBe('Aberg-Wistedt et al, 2000');
        expect(result[0].armName).toBe('Paroxetine');
        expect(result[0].deviance).toBe(testStatistics.perArmDeviance['Aberg-Wistedt et al, 2000'][0]);
        expect(result[0].leverage).toBe(testStatistics.perArmLeverage['Aberg-Wistedt et al, 2000'][0]);
        expect(result[0].rowSpan).toBe(2);
        expect(result[1].rowSpan).not.toBeDefined();
      });
    });
  });
});
