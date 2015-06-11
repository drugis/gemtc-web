'use strict';
define(['angular', 'lodash', 'papaparse'], function (angular, _, papaparse) {
  var dependencies = [];

  var CSVParseService = function () {

    function parse(input) {
      return papaparse.parse(input, {
        skipEmptyLines: true,
        dynamicTyping: true
      }).data;
    }

    function buildTreatmentMap(dataLines) {
      var treatmentMap = {};

      _.forEach(dataLines, function (line) {
        if (!treatmentMap[line[1]]) {
          treatmentMap[line[1]] = _.keys(treatmentMap).length + 1;
        }
      });
      return treatmentMap;
    }

    function buildTreatments(treatmentMap) {
      return _.map(treatmentMap, function (treatmentId, treatmentName) {
        return {
          id: treatmentId,
          name: treatmentName
        };
      });
    }

    function linesToProblem(lines) {
      var headerLine = lines[0];
      var dataLines = lines.slice(1, lines.length);
      var treatmentMap = buildTreatmentMap(dataLines);

      var entries = _.map(dataLines, function (line) {
        var entry = _.zipObject(headerLine, line);
        entry.treatment = treatmentMap[entry.treatment]; // substitute entry name with its ID
        return entry;
      });

      return {
        entries: entries,
        treatments: buildTreatments(treatmentMap)
      };
    }

    return {
      linesToProblem: linesToProblem,
      parse: parse
    };

  };

  return dependencies.concat(CSVParseService);
});
