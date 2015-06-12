define(['angular', 'angular-mocks', 'util/util'], function() {
  describe('the csv parse service', function() {

    var csvParseService;
    var validCsv = '"study","treatment","mean","std.dev","sampleSize"\n' +
      '"1","A",-1.22,3.7,54\n' +
      '"1","C",-1.53,4.28,95\n' +
      '"2","A",-0.7,3.7,172\n' +
      '"2","B",-2.4,3.4,173\n';

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
          name: 'C'
        }, {
          id: 3,
          name: 'B'
        }];
        var expectedFirstEntry = {
          study: 1,
          treatment: 1,
          mean: -1.22,
          'std.dev': 3.7,
          sampleSize: 54
        };

        expect(parseResult.isValid).toBe(true);
        expect(parseResult.problem.treatments).toEqual(expectedTreatments);
        expect(parseResult.problem.entries.length).toEqual(4);
        expect(parseResult.problem.entries[0]).toEqual(expectedFirstEntry);
      });

      it('should fail on invalid csv', function() {
        var nonsense = 'agkjhfkl';
        var parseResult = csvParseService.parse(nonsense);
        expect(parseResult.isValid).toBe(false);
        expect(parseResult.message).toBe('Unable to auto-detect delimiting character; defaulted to \',\';');
      });

    });

  });
});
