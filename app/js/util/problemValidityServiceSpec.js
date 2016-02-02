'use strict';
define(['angular', 'angular-mocks', 'util/util'], function() {
  describe('the problem validity service', function() {

    var problemValidityService;

    beforeEach(module('gemtc.util'));

    beforeEach(inject(function(ProblemValidityService) {
      problemValidityService = ProblemValidityService;
    }));

    describe('getValidity', function() {
      it('should return false for null problems ', function() {
        var nullProblem = null;
        var result = problemValidityService.getValidity(nullProblem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('The problem file is empty.');
      });

      it('should return false for undefined problems ', function() {
        var undefinedProblem;
        var result = problemValidityService.getValidity(undefinedProblem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('The problem file is empty.');
      });

      it('should return false for empty problems ', function() {
        var emptyProblem = '';
        var result = problemValidityService.getValidity(emptyProblem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('The problem file is empty.');
      });

      it('should return false for problems without entries ', function() {
        var entrylessProblem = {};
        var result = problemValidityService.getValidity(entrylessProblem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('The problem does not contain a list of entries');
      });

      it('should return false for problems without treatments ', function() {
        var treatmentlessProblem = {};
        var result = problemValidityService.getValidity(treatmentlessProblem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('The problem does not contain a list of treatments');
      });

      it('should return true for a valid problem', function() {
        var problem = {
          entries: [{
            study: 1,
            treatment: 1
          }],
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        };
        var result = problemValidityService.getValidity(problem);
        expect(result.isValid).toBe(true);
      });

      it('should return true for a valid relative effects data problem', function() {
        var problem = {
          entries: [{
            study: 1,
            treatment: 1
          }],
          relativeEffectData: {
            scale: "mean difference",
            data: {
              2: {
                baseArm: {
                  treatment: 1,
                  baseArmStandardError: 0.3
                },
                otherArms: []
              }
            }
          },
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        };
        var result = problemValidityService.getValidity(problem);
        expect(result.isValid).toBe(true);
      });

      it('should return false for a problem in which a study has both relative effects and absolute data', function() {
        var problem = {
          entries: [{
            study: 1,
            treatment: 1
          }],
          relativeEffectData: {
            data: {
              1: {
                baseArm: {
                  treatment: 1,
                  baseArmStandardError: 0.3
                },
                otherArms: []
              }
            }
          },
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        };
        var result = problemValidityService.getValidity(problem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain(' Studies may not have both relative effects data and absolute data');
      });

      it('should return false for a relative effect problem in which a study has more than 2 arms but no base arm standardError', function() {
        var problem = {
          entries: [],
          relativeEffectData: {
            scale: "mean difference",
            data: {
              2: {
                baseArm: {
                  treatment: 1,
                },
                otherArms: [{
                  treatment: 1,
                  meanDifference: 2,
                  standardError: 3
                }, {
                  treatment: 1,
                  meanDifference: 2,
                  standardError: 3
                }]
              }
            }
          },
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        };
        var result = problemValidityService.getValidity(problem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain(' Relative effects data must contain baseArmStandardError if the study contains more than 2 arms');
      });

      it('should return false for malformed relativeEffectData', function() {
        var problem = {
          entries: [],
          relativeEffectData: {
            scale: "mean difference",
            data: {
              2: {
                baseArm: {
                  treatment: 1,
                },
                otherArms: [{}]
              }
            }
          },
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        };
        var result = problemValidityService.getValidity(problem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain(' Relative effects data must have at least a study and a treatment, and for non-base arms a mean difference and standard error.');
      });

      it('should return false for an incorrect scale if there is relative effects data', function() {
        var problem = {
          entries: [],
          relativeEffectData: {
            scale: "jan de behanger",
            data: {
              2: {
                baseArm: {
                  treatment: 1,
                },
                otherArms: [{
                  treatment: 1,
                  meanDifference: 2,
                  standardError: 3
                }]
              }
            }
          },
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        };
        var result = problemValidityService.getValidity(problem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain(' Relative effects data must define a valid scale.');
      });

      it('should return false for a malformed entry', function() {
        var problem = {
          entries: [{
            notATreatment: 3,
            notAStudy: 5
          }],
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        };
        var result = problemValidityService.getValidity(problem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain(' The entries must be a list of data rows, each data row must contain at least the study and treatment columns');
      });

      it('should return false for inconsistent entries', function() {
        var problem = {
          entries: [{
            treatment: 1,
            study: 5,
            stddev: 0.3,
            sampleSize: 30
          }, {
            treatment: 1,
            study: 5,
            rate: 0.3,
            sampleSize: 30
          }],
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        };
        var result = problemValidityService.getValidity(problem);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('Each entry must have the same data columns');
      });

      describe('when an entry refers to an nonexistent treatment', function() {
        var problem;
        var result;
        beforeEach(function() {
          problem = {
            entries: [{
              study: 1,
              treatment: 'no such treatment'
            }],
            treatments: [{
              id: 1,
              name: 'treatment 1'
            }]
          };
          result = problemValidityService.getValidity(problem);
        });

        it('the validity should be false', function() {
          expect(result.isValid).toBe(false);
          expect(result.message).toContain(' The entries must be a list of data rows, each data row must contain at least the study and treatment columns');
        });

      });

    });

    describe('parse', function() {
      it('should return false for a null string object ', function() {
        var nullString = null;
        var result = problemValidityService.parse(nullString);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('The file does not containt a valid json object');
      });

      it('should return false for a non json string string object ', function() {
        var noJsonString = "this is no json";
        var result = problemValidityService.parse(noJsonString);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('The file does not containt a valid json object');
      });

      it('should return false for a invalid json string string object ', function() {
        var invalidJson = "{foo: [1, 2, 3], bar; 'error";
        var result = problemValidityService.parse(invalidJson);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('The file does not containt a valid json object');
      });
    });

  });
});
