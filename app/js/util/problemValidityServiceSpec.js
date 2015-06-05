define(['angular', 'angular-mocks', 'util/util'], function() {
  describe('the problem validity service', function() {

    var problemValidityService

    beforeEach(module('gemtc.util'));

    beforeEach(inject(function(ProblemValidityService) {
      problemValidityService = ProblemValidityService;
    }));

    describe('getValidity', function() {
      it('should return false for null problems ', function() {
        var nullProblem = null;
        var result = problemValidityService.getValidity(nullProblem);
        expect(result.isValid).toBe(false);
        expect(result.messages).toContain('The problem file is empty.');
      });

      it('should return false for undefined problems ', function() {
        var undefinedProblem = undefined;
        var result = problemValidityService.getValidity(undefinedProblem);
        expect(result.isValid).toBe(false);
        expect(result.messages).toContain('The problem file is empty.');
      });

      it('should return false for empty problems ', function() {
        var emptyProblem = '';
        var result = problemValidityService.getValidity(emptyProblem);
        expect(result.isValid).toBe(false);
        expect(result.messages).toContain('The problem file is empty.');
      });

      it('should return false for problems without entries ', function() {
        var entrylessProblem = {};
        var result = problemValidityService.getValidity(entrylessProblem);
        expect(result.isValid).toBe(false);
        expect(result.messages).toContain('The problem does not contain a list of entries');
      });

      it('should return false for problems without treatments ', function() {
        var treatmentlessProblem = {};
        var result = problemValidityService.getValidity(treatmentlessProblem);
        expect(result.isValid).toBe(false);
        expect(result.messages).toContain('The problem does not contain a list of treatments');
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
        }
        var result = problemValidityService.getValidity(problem);
        console.log(JSON.stringify(result));
        expect(result.isValid).toBe(true);
      });

      it('should return true for a valid problem', function() {
        var problem = {
          entries: [{
            study: 1,
            treatment: 1
          },
          {
            treatment: 1,
            study: 1,
          }],
          treatments: [{
            id: 1,
            name: 'treatment 1'
          }]
        }
        var result = problemValidityService.getValidity(problem);
        console.log(JSON.stringify(result));
        expect(result.isValid).toBe(true);
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
        expect(result.messages).toContain('The entries must be a list of data rows; Each data row must contain at least the study and treatment columns');
      });

      it('should return false for inconsistent entries', function() {
        var problem = {
          entries: [{
            treatment: 1,
            study: 5,
            stddev: 0.3,
            sampleSize: 30
          },{
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
        console.log(JSON.stringify(result));
        expect(result.isValid).toBe(false);
        expect(result.messages).toContain('Each entry must have the same data columns');
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
          expect(result.messages).toContain('The entries must be a list of data rows; Each data row must contain at least the study and treatment columns');
        });

      });

    });

  });
});