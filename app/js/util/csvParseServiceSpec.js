'use strict';
define(['angular', 'angular-mocks', 'util/util'], function() {
  describe('the csv parse service', function() {

    var csvParseService;
    var validAbsoluteCsv = '"study","treatment","mean","std.dev","sampleSize","LENGTH_OF_FOLLOW_UP","BLINDING_AT_LEAST_DOUBLE_BLIND"\n' +
      '"1","A",-1.22,3.7,54,31,1\n' +
      '"1","C",-1.53,4.28,95,31,1\n' +
      '"2","A",-0.7,3.7,172,,0\n' +
      '"2","B",-2.4,3.4,173,,0\n';
    var validAbsoluteCsvWithStupidSpaces = '"study ","treatment","mean","std.dev","sampleSize","LENGTH_OF_FOLLOW_UP","BLINDING_AT_LEAST_DOUBLE_BLIND"\n' +
      '"1","A",-1.22,3.7,54,31,1\n' +
      '"1","C", -1.53 ,4.28,95,31,1\n' +
      '"2","A",-0.7,3.7,172,  ,0\n' +
      '"2","B",-2.4,3.4, 173,,0\n';

    var validEuropeanAbsoluteCsv = '"study";"treatment";"mean";"std.dev";"sampleSize"\n' +
      '"1";"A";-1,22;3,7;54\n' +
      '"1";"C";-1,53;4,28;95\n' +
      '"2";"A";-0,7;3,7;172\n' +
      '"2";"B";-2,4;3,4;173\n';

    var validMixedEffectCsv = 'study,treatment,mean,std.dev,sampleSize,re.diff,re.diff.se\n' +
      '1,A,-1.22,0.504,1,NA,NA\n' +
      '1,C,-1.53,0.439,1,NA,NA\n' +
      '2,A,-0.7,0.282,1,NA,NA\n' +
      '2,B,-2.4,0.258,1,NA,NA\n' +
      '4,C,NA,NA,NA,NA,NA\n' +
      '4,D,NA,NA,NA,-0.35,0.441941738\n' +
      '5,C,NA,NA,NA,NA,NA\n' +
      '5,D,NA,NA,NA,0.55,0.555114559\n';

    var validRelativeOnlyCsv = 'study,treatment,re.diff,re.diff.se,re.base.se\n' +
      '1,A,NA,NA,0.5035062\n' +
      '1,C,-0.31,0.668089651,NA\n' +
      '2,A,,,0.2821224\n' +
      '2,B,-1.7,0.382640605,NA\n';


    beforeEach(module('gemtc.util'));

    beforeEach(inject(function(CSVParseService) {
      csvParseService = CSVParseService;
    }));

    describe('parse', function() {

      it('should parse valid absolute csv', function() {

        var parseResult = csvParseService.parse(validAbsoluteCsv);
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
        };

        expect(parseResult.isValid).toBe(true);
        expect(parseResult.problem.treatments).toEqual(expectedTreatments);
        expect(parseResult.problem.entries.length).toEqual(4);
        expect(parseResult.problem.entries[0]).toEqual(expectedFirstEntry);
        expect(parseResult.problem.studyLevelCovariates).toBeDefined();
        expect(parseResult.problem.studyLevelCovariates).toEqual(expectedCovariates);
        expect(typeof parseResult.problem.entries[0].study).toBe('string');
      });

      it('should parse valid absolute csv with erroneous spaces', function() {

        var parseResult = csvParseService.parse(validAbsoluteCsvWithStupidSpaces);
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
        };

        expect(parseResult.isValid).toBe(true);
        expect(parseResult.problem.treatments).toEqual(expectedTreatments);
        expect(parseResult.problem.entries.length).toEqual(4);
        expect(parseResult.problem.entries[0]).toEqual(expectedFirstEntry);
        expect(parseResult.problem.studyLevelCovariates).toBeDefined();
        expect(parseResult.problem.studyLevelCovariates).toEqual(expectedCovariates);
        expect(typeof parseResult.problem.entries[0].study).toBe('string');
      });
      it('should parse valid Euro-peen absolute csv', function() {

        var parseResult = csvParseService.parse(validEuropeanAbsoluteCsv);
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
          S1: {
            'BLINDING_AT_LEAST_DOUBLE_BLIND': 1.0,
            'LENGTH_OF_FOLLOW_UP': 31
          },
          S2: {
            BLINDING_AT_LEAST_DOUBLE_BLIND: 0.0,
            LENGTH_OF_FOLLOW_UP: null
          }
        };

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

      it('should raise an error when the covariates are not numeric', function() {
        var validCsvOneCovariate = '"study","treatment","mean","std.dev","sampleSize","LENGTH_OF_FOLLOW_UP"\n' +
          '"S1","A",-1.22,3.7,54,one\n' +
          '"S1","C",-1.53,4.28,95,one\n' +
          '"S2","A",-0.7,3.7,172,two\n' +
          '"S2","B",-2.4,3.4,173,two\n';
        var parseResult = csvParseService.parse(validCsvOneCovariate);
        expect(parseResult.isValid).toBe(false);
        expect(parseResult.message).toBe('Error: non-numeric data in data column');
      });

      it('should parse mixed absolute and relative effects data', function() {
        var expectedRelativeDifferenceData = {
          data: {
            4: {
              otherArms: [{
                treatment: 4,
                meanDifference: -0.35,
                standardError: 0.441941738
              }],
              baseArm: {
                treatment: 3
              }
            },
            5: {
              otherArms: [{
                treatment: 4,
                meanDifference: 0.55,
                standardError: 0.555114559
              }],
              baseArm: {
                treatment: 3
              }
            }
          }
        };
        var parseResult = csvParseService.parse(validMixedEffectCsv);
        expect(parseResult.isValid).toBe(true);
        expect(parseResult.problem.relativeEffectData).toEqual(expectedRelativeDifferenceData);
      });

      it('should parse only relative effects data', function() {
        //study,treatment,re.diff,re.diff.se,re.base.se
        // '1,A,NA,NA,0.5035062' +
        // '1,C,-0.31,0.668089651,NA' +
        // '2,A,NA,NA,0.2821224' +
        // '2,B,-1.7,0.382640605,NA';        //
        var expectedRelativeDifferenceData = {
          data: {
            1: {
              otherArms: [{
                treatment: 3,
                meanDifference: -0.31,
                standardError: 0.668089651
              }],
              baseArm: {
                treatment: 1,
                baseArmStandardError: 0.5035062
              }
            },
            2: {
              otherArms: [{
                treatment: 2,
                meanDifference: -1.7,
                standardError: 0.382640605
              }],
              baseArm: {
                treatment: 1,
                baseArmStandardError: 0.2821224
              }
            }
          }
        };
        var parseResult = csvParseService.parse(validRelativeOnlyCsv);
        expect(parseResult.isValid).toBe(true);
        expect(parseResult.problem.relativeEffectData).toEqual(expectedRelativeDifferenceData);
      });

    });

  });
});
