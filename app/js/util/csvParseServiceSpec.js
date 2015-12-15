define(['angular', 'angular-mocks', 'util/util'], function() {
  describe('the csv parse service', function() {

    var csvParseService;
    var validCsv = '"study","treatment","mean","std.dev","sampleSize","LENGTH_OF_FOLLOW_UP","BLINDING_AT_LEAST_DOUBLE_BLIND"\n' +
      '"1","A",-1.22,3.7,54,31,1\n' +
      '"1","C",-1.53,4.28,95,31,1\n' +
      '"2","A",-0.7,3.7,172,,0\n' +
      '"2","B",-2.4,3.4,173,,0\n';

    var validEuropeanCsv = '"study";"treatment";"mean";"std.dev";"sampleSize"\n' +
      '"1";"A";-1,22;3,7;54\n' +
      '"1";"C";-1,53;4,28;95\n' +
      '"2";"A";-0,7;3,7;172\n' +
      '"2";"B";-2,4;3,4;173\n';

    beforeEach(module('gemtc.util'));

    beforeEach(inject(function(CSVParseService) {
      csvParseService = CSVParseService;
    }));

    describe('parse', function() {
      it('should parse valid csv', function() {

        var parseResult = csvParseService.parse(validCsv);
        var expectedTreatments = [{
          id: 1,
          name: 'A'
        }, {
          id: 2,
          name: 'B'
        }, {
          id: 3,
          name: 'C'
        }];
        var expectedFirstEntry = {
          study: '1',
          treatment: 1,
          mean: -1.22,
          'std.dev': 3.7,
          sampleSize: 54
        };

        var expectedCovariates = {
          "1": {
            "BLINDING_AT_LEAST_DOUBLE_BLIND": 1.0,
            "LENGTH_OF_FOLLOW_UP": 31
          },
          "2": {
            "BLINDING_AT_LEAST_DOUBLE_BLIND": 0.0,
            "LENGTH_OF_FOLLOW_UP": null
          }
        }

        expect(parseResult.isValid).toBe(true);
        expect(parseResult.problem.treatments).toEqual(expectedTreatments);
        expect(parseResult.problem.entries.length).toEqual(4);
        expect(parseResult.problem.entries[0]).toEqual(expectedFirstEntry);
        expect(parseResult.problem.studyLevelCovariates).toBeDefined();
        expect(parseResult.problem.studyLevelCovariates).toEqual(expectedCovariates);
        expect(typeof parseResult.problem.entries[0].study).toBe('string');
      });
      it('should parse valid Euro-peen csv', function() {

        var parseResult = csvParseService.parse(validEuropeanCsv);
        var expectedTreatments = [{
          id: 1,
          name: 'A'
        }, {
          id: 2,
          name: 'B'
        }, {
          id: 3,
          name: 'C'
        }];
        var expectedFirstEntry = {
          study: '1',
          treatment: 1,
          mean: -1.22,
          'std.dev': 3.7,
          sampleSize: 54
        };

        expect(parseResult.isValid).toBe(true);
        expect(parseResult.problem.treatments).toEqual(expectedTreatments);
        expect(parseResult.problem.entries.length).toEqual(4);
        expect(parseResult.problem.entries[0]).toEqual(expectedFirstEntry);
        expect(typeof parseResult.problem.entries[0].study).toBe('string');
      });
      it('should parse covariates where only one arm has a value', function() {
        var validCsvOneCovariate = '"study","treatment","mean","std.dev","sampleSize","LENGTH_OF_FOLLOW_UP","BLINDING_AT_LEAST_DOUBLE_BLIND"\n' +
          '"S1","A",-1.22,3.7,54,31,1\n' +
          '"S1","C",-1.53,4.28,95,31,\n' +
          '"S2","A",-0.7,3.7,172,,0\n' +
          '"S2","B",-2.4,3.4,173,,0\n';
        var expectedCovariates = {
          "S1": {
            "BLINDING_AT_LEAST_DOUBLE_BLIND": 1.0,
            "LENGTH_OF_FOLLOW_UP": 31
          },
          "S2": {
            "BLINDING_AT_LEAST_DOUBLE_BLIND": 0.0,
            "LENGTH_OF_FOLLOW_UP": null
          }
        }

        var parseResult = csvParseService.parse(validCsvOneCovariate);
        expect(parseResult.isValid).toBe(true);
        expect(parseResult.problem.studyLevelCovariates).toBeDefined();
        expect(parseResult.problem.studyLevelCovariates).toEqual(expectedCovariates);
      });
      it('should raise an error when a covariate has a different version for different arms within the same study', function() {
        var validCsvOneCovariate = '"study","treatment","mean","std.dev","sampleSize","LENGTH_OF_FOLLOW_UP","BLINDING_AT_LEAST_DOUBLE_BLIND"\n' +
          '"S1","A",-1.22,3.7,54,31,1\n' +
          '"S1","C",-1.53,4.28,95,31,0\n' +
          '"S2","A",-0.7,3.7,172,,1\n' +
          '"S2","B",-2.4,3.4,173,,1\n';
        var parseResult = csvParseService.parse(validCsvOneCovariate);
        expect(parseResult.isValid).toBe(false);
        expect(parseResult.message).toBe('Inconsistent covariates: study S1, column BLINDING_AT_LEAST_DOUBLE_BLIND');
      });
      it('should fail on invalid csv', function() {
        var nonsense = 'a,"b,c\nd,e';
        var parseResult = csvParseService.parse(nonsense);
        expect(parseResult.isValid).toBe(false);
        expect(parseResult.message).toBe('Quoted field unterminated;');
      });

    });

  });
});