define(['angular', 'angular-mocks', 'util/util'], function () {
  describe('the problem validity service', function () {

    var csvParseService;
    var validCsv = '"study","treatment","mean","std.dev","sampleSize"\n' +
      '"1","A",-1.22,3.7,54\n' +
      '"1","C",-1.53,4.28,95\n' +
      '"2","A",-0.7,3.7,172\n' +
      '"2","B",-2.4,3.4,173\n';

    beforeEach(module('gemtc.util'));

    beforeEach(inject(function (CSVParseService) {
      csvParseService = CSVParseService;
    }));

    describe('parse', function () {
      it('should parse valid csv', function () {

        var parseResult = csvParseService.parse(validCsv);

        expect(parseResult).not.toBe(null);
        expect(parseResult.length).toBe(5);
      });
    });

    describe('linesToProblem', function () {

      describe('for valid csv', function () {
        it('should map the lines to a problem', function () {
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
          var validLines = csvParseService.parse(validCsv);
          var result = csvParseService.linesToProblem(validLines);

          expect(result.treatments).toEqual(expectedTreatments);
          expect(result.entries.length).toEqual(4);
          expect(result.entries[0]).toEqual(expectedFirstEntry);
        });
      });

    });

  });
});
