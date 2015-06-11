define(['angular', 'angular-mocks', 'util/util'], function() {
  fdescribe('the problem validity service', function() {

    var csvParseService;
    var csv = '"study","treatment","mean","std.dev","sampleSize"\n' +
      '"1","A",-1.22,3.7,54\n' +
      '"1","C",-1.53,4.28,95\n' +
      '"2","A",-0.7,3.7,172\n' +
      '"2","B",-2.4,3.4,173\n';

    beforeEach(module('gemtc.util'));

    beforeEach(inject(function(CSVParseService) {
      csvParseService = CSVParseService;
    }));

    describe('parse', function() {
      it('should parse csv', function() {

        var parseResult = csvParseService.parse(csv);

        expect(parseResult).not.toBe(null);
        expect(parseResult.length).toBe(5);
      });
    });

    describe('linesToProblem', function() {

      describe('for valid csv', function() {
        it('should map the lines to a problem', function() {
          var validLines = csvParseService.parse(csv);
          var result =csvParseService.linesToProblem(validLines);

          expect(result.treatments.sort()).toEqual(['A','C','B'].sort());
          expect(result.entries.length).toEqual(4);
        });
      });

    });

  });
});
