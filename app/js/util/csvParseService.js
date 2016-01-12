'use strict';
define(['angular', 'lodash', 'papaparse'], function(angular, _, papaparse) {
  var dependencies = [];

  var ENTRY_COLUMN_OPTIONS = [
    'mean',
    'std.dev',
    'std.err',
    'sampleSize',
    'responders',
    'exposure',
    'study',
    'treatment'
  ];

  var RELATIVE_EFFECTS_COLUMN_OPTIONS = [
    'study',
    'treatment',
    're.diff',
    're.diff.se',
    're.base.se'
  ];

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

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
  var CSVParseService = function() {

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

      if (parseResult.errors.length > 0) {
        return {
          isValid: false,
          message: _.reduce(parseResult.errors, function(accum, error) {
            return accum + error.message + ';';
          }, '')
        };
      } else {
        if (parseResult.meta.delimiter === ';') {
          parseResult.data = normaliseData(parseResult.data);
        }
        return parseLines(parseResult.data);
      }
    }

    function normaliseData(data) {
      function stringToNumber(datum) {
        if (isNumeric(datum)) {
          return datum;
        } else {
          return parseFloat(datum.replace(',', '.'));
        }
      }
      var header = data[0];
      var normalisedRows = _.map(data.slice(1, data.length), function(dataLine) {
        var studyAndTreatment = dataLine.slice(0, 2);
        var numericalData = dataLine.slice(2, dataLine.length);
        return studyAndTreatment.concat(_.map(numericalData, stringToNumber));
      });
      return [].concat([header], normalisedRows);
    }

    /**
     * build map of treatments name -> id
     **/
    function buildTreatmentMap(dataLines) {
      var treatmentMap = {};

      _.forEach(dataLines, function(line) {
        if (!treatmentMap[line[1]]) {
          // generate sequential ids for treatments
          treatmentMap[line[1]] = _.keys(treatmentMap).length + 1;
        }
      });
      return treatmentMap;
    }

    function buildTreatments(treatmentMap) {
      return _.map(treatmentMap, function(treatmentId, treatmentName) {
        return {
          id: treatmentId,
          name: treatmentName
        };
      });
    }

    function emptyStringToNull(val) {
      return val === '' ? null : val;
    }

    function extractCovariates(structuredLines) {
      return _.reduce(structuredLines, function(accum, line) {
        var covariates = _.omit(line, ENTRY_COLUMN_OPTIONS.concat(RELATIVE_EFFECTS_COLUMN_OPTIONS));
        covariates = _.mapValues(covariates, emptyStringToNull);
        if (!accum[line.study]) {
          accum[line.study] = [];
        }
        accum[line.study].push(covariates);
        return accum;
      }, {});
    }

    /**
     * Check whether a study's arms are consistent as regards their covariate values.
     * Permissible: 1) a single value, and the rest blank (null)
     *              2) all the same value
     **/

    function checkStudyConsistency(studyArms) {
      var covariateNames = _.keys(studyArms[0]);
      var errorColumn;
      var covValues = {};
      _.find(studyArms, function(arm) {
        return errorColumn = _.find(covariateNames, function(covariateName) {
          if (covValues[covariateName] !== undefined && arm[covariateName] !== null && arm[covariateName] !== covValues[covariateName]) {
            return true;
          }
          covValues[covariateName] = arm[covariateName];
        });
      });
      return errorColumn;
    }

    function checkConsistency(covariates) {
      var errorMessage = '';
      var error = _.find(covariates, function(studyCovariates, key) {
        var errorColumn = checkStudyConsistency(studyCovariates);
        if (errorColumn) {
          errorMessage = 'Inconsistent covariates: study ' + key + ', column ' + errorColumn;
        }
      });

      return errorMessage;
    }

    function compressPerStudy(studyArms) {
      return _.reduce(studyArms, function(accum, arm) {
        var columnNames = _.keys(arm);
        _.each(columnNames, function(covariateName) {
          if (accum[covariateName] === undefined || arm[covariateName] !== null) {
            accum[covariateName] = arm[covariateName];
          }
        });
        return accum;
      }, {});
    }

    function compressCovariates(covariates) {
      return _.mapValues(covariates, compressPerStudy);
    }

    function checkNumeric(studyLevelCovariates) {
      var errorMessage = '';
      _.find(studyLevelCovariates, function(study, studyName) {
        return _.find(study, function(covariate, covariateName) {
          if (covariate !== null && !isNumeric(covariate)) {
            return errorMessage = 'Non-numeric covariate: study ' + studyName + ', column ' + covariateName;
          }
        });
      });
      return errorMessage;
    }

    /**
     * Takes an array of lines, expects the first line to contain column names
     * produces an ADDIS problem, with a property 'entries' and a property 'treatments'
     * Entries contains one object per line, with key:value pairs
     * where the key is the name of the column and the value is the value in the
     * data line. Treatments are referenced by ID
     * The study column should contain string values.
     * Treatments contains all the treatments, with and ID and name property
     **/
    function parseLines(lines) {

      var parseResult = {
        isValid: true,
        message: '',
        problem: {}
      };

      var headerLine = lines[0];

      var dataLines = lines.slice(1, lines.length);

      // sort datalines by treatment names
      var sortedDataLines = dataLines.sort(function(a, b) {
        if (a[1] > b[1]) {
          return 1;
        }
        if (a[1] < b[1]) {
          return -1;
        }
        return 0;
      });
      var treatmentMap = buildTreatmentMap(sortedDataLines);

      function convertStudyValueToString(arm) {
        return arm.study.toString();
      }

      var structuredLines = _.map(sortedDataLines, function(line) {
        var arm = _.zipObject(headerLine, line);
        arm.study = convertStudyValueToString(arm);
        // substitute treatment name with its ID
        arm.treatment = treatmentMap[arm.treatment];
        return arm;
      });

      function isEntry(entryCandidate) {
        return !_.contains(_.values(entryCandidate), 'NA');
      }

      function lineToEntry(line) {
        return _.pick(line, ENTRY_COLUMN_OPTIONS);
      }

      function isRelativeEffect(line) {
        return _.contains(_.values(lineToEntry(line)), 'NA');
      }

      function lineToRelativeEffect(line) {
        return _.pick(line, RELATIVE_EFFECTS_COLUMN_OPTIONS);
      }

      function addToRelativeEffectData(accum, entry) {
        function isBaseEntry(entry) {
          return entry['re.diff'] === 'NA' && entry['re.diff.se'] === 'NA';
        }

        if(!accum[entry.study]) {
          accum[entry.study] = {
            otherArms: []
          };
        }

        if(isBaseEntry(entry)) {
          var baseArm = {
            treatment: entry.treatment
          };
          if (entry['re.base.se' !== undefined]) {
            baseArm.baseArmStandardError = entry['re.base.se'];
          }
          accum[entry.study].baseArm = baseArm;
        } else {
          accum[entry.study].otherArms.push({
            treatment: entry.treatment,
            meanDifference: entry['re.diff'],
            standardError: entry['re.diff.se']
          });
        }
        return accum;
      }

      var entries = structuredLines
        .map(lineToEntry)
        .filter(isEntry);

       var relativeEffectEntries =  structuredLines
        .filter(isRelativeEffect)
        .map(lineToRelativeEffect);

      var relativeEffectData = _.reduce(relativeEffectEntries, addToRelativeEffectData, {});


      var studyLevelCovariates = extractCovariates(structuredLines);

      var consistencyErrorMessage = checkConsistency(studyLevelCovariates);
      parseResult.isValid = !consistencyErrorMessage;
      parseResult.message = !consistencyErrorMessage ? '' : consistencyErrorMessage;

      if (parseResult.isValid) {
        studyLevelCovariates = compressCovariates(studyLevelCovariates);
      }

      if (parseResult.isValid) {
        var numericErrorMesasge = checkNumeric(studyLevelCovariates, parseResult);
        parseResult.isValid = !numericErrorMesasge;
        parseResult.message = !numericErrorMesasge ? '' : numericErrorMesasge;
      }

      parseResult.problem = {
        entries: entries,
        treatments: buildTreatments(treatmentMap),
        studyLevelCovariates: studyLevelCovariates,
        relativeEffectData: relativeEffectData
      };

      return parseResult;
    }

    return {
      parse: parse
    };

  };

  return dependencies.concat(CSVParseService);
});
