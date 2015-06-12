'use strict';
define(['angular', 'lodash', 'papaparse'], function (angular, _, papaparse) {
  var dependencies = [];

  /**
   Service to transform csv files to ADDIS problems.
   Example csv:
      "study","treatment","mean","std.dev","sampleSize"
      "1","A",-1.22,3.7,54
      "1","C",-1.53,4.28,95
    corresponding problem:
    {
      entries: [{
            study: 1,
            treatment: 1,
            mean: -1.22,
            'std.dev': 3.7,
            sampleSize: 54
          },
          {
            study: 1,
            treatment: 2,
            mean: -1.53,
            'std.dev': 4.28,
            sampleSize: 95
          }],
      treatments: [{
        id: 1,
        name: 'A'
      }, {
        id: 2,
        name: 'C'
      }]
    }
  **/

  var CSVParseService = function () {

    /**
    * Takes a string in csv format
    * returns an object
    * {
    *   isValid,  // is the csv valid?
    *   message,  // if not valid, message contains reasons/feedback
    *   problem   // if valid, an ADDIS problem corresponding to the .csv
    * }
    **/
    function parse(input) {
      var parseResult = papaparse.parse(input, {
        skipEmptyLines: true,
        dynamicTyping: true
      });
      if(parseResult.errors.length > 0) {
        return {
          isValid: false,
          message: _.reduce(parseResult.errors, function(accum, error){
            return accum + error.message + ';'
          }, '')
        }
      } else {
        return {
          isValid: true,
          message: '',
          problem: linesToProblem(parseResult.data)
        }
      }
    }

    /**
    * build map of treatments name -> id
    **/
    function buildTreatmentMap(dataLines) {
      var treatmentMap = {};

      _.forEach(dataLines, function (line) {
        if (!treatmentMap[line[1]]) {
          // generate sequential ids for treatments
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

    /**
    * Takes an array of lines, expects the first line to contain column names
    * produces an ADDIS problem, with a property 'entries' and a property 'treatments'
    * Entries contains one object per line, with key:value pairs
    * where the key is the name of the column and the value is the value in the
    * data line. Treatments are referenced by ID
    * Treatments contains all the treatments, with and ID and name property
    **/
    function linesToProblem(lines) {
      var headerLine = lines[0];
      var dataLines = lines.slice(1, lines.length);
      var treatmentMap = buildTreatmentMap(dataLines);

      var entries = _.map(dataLines, function (line) {
        var entry = _.zipObject(headerLine, line);
        // substitute treatment name with its ID
        entry.treatment = treatmentMap[entry.treatment];
        return entry;
      });

      return {
        entries: entries,
        treatments: buildTreatments(treatmentMap)
      };
    }

    return {
      parse: parse
    };

  };

  return dependencies.concat(CSVParseService);
});
