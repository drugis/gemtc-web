'use strict';
define(['angular', 'lodash', 'papaparse'], function(angular, _, papaparse) {
  var dependencies = [];

  var CSVParseService = function() {

    function parse(input) {
      return papaparse.parse(input, {
        skipEmptyLines: true
      }).data;
    }

    function linesToProblem(lines) {

      function buildTreatmentMap(dataLines) {
        var treatments = {};

        _.forEach(dataLines, function(line) {
          if (!treatments[line[1]]) {
            treatments[line[1]] = _.keys(treatments).length + 1;
          }
        });
        return treatments
      }

      var headerLine = lines[0];
      var dataLines = lines.slice(1, lines.length);
      var treatments = buildTreatmentMap(dataLines);

      var entries = _.map(dataLines, function(line) {
        var entry = _.mapKeys(line, function(key) {
          return headerLine[key];
        });
        entry.treatment = treatments[entry.treatment];
        return entry;
      });

      return {
        entries: entries,
        treatments: _.keys(treatments)
      }
    }

    return {
      linesToProblem: linesToProblem,
      parse: parse
    }

  };

  return dependencies.concat(CSVParseService);
});
