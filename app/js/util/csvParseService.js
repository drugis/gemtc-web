'use strict';
define(['lodash', 'papaparse', 'angular'], function(_, papaparse) {
  var dependencies = [];

  var STUDY_TREATMENT = [
    'study',
    'treatment'
  ];

  var ENTRY_COLUMN_OPTIONS = [
    'mean',
    'std.dev',
    'std.err',
    'sampleSize',
    'responders',
    'exposure'
  ];

  var RELATIVE_EFFECTS_COLUMN_OPTIONS = [
    're.diff',
    're.diff.se',
    're.base.se'
  ];

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
        var normalisedData = normaliseData(parseResult.data);
        if (normalisedData.isValid) {
          return parseLines(normalisedData.data);
        } else {
          return normalisedData;
        }
      }
    }

    function normaliseData(data) {
      var isValid = true;

      function stringToDatum(datum) {
        if (isNumeric(datum)) {
          return datum;
        } else {
          if (datum === null || datum.trim() === '') {
            return null;
          } else if (datum.trim() === 'NA') {
            return 'NA';
          } else {
            var parsedVal = parseFloat(datum.trim().replace(',', '.'));
            if (isNaN(parsedVal)) {
              isValid = false;
            }
            return parsedVal;
          }
        }
      }

      var header = _.map(data[0], function(col) {
        return col.trim();
      });
      var normalisedRows = _.map(data.slice(1, data.length), function(dataLine) {
        var study = dataLine[0].toString().trim();
        var treatment = dataLine[1].toString().trim();
        var numericalData = dataLine.slice(2, dataLine.length);
        return [study, treatment].concat(_.map(numericalData, stringToDatum));
      });
      return {
        isValid: isValid,
        message: isValid ? '' : 'Error: non-numeric data in data column',
        data: [].concat([header], normalisedRows)
      };
    }

    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
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
      var standardProperties = ENTRY_COLUMN_OPTIONS.concat(RELATIVE_EFFECTS_COLUMN_OPTIONS, STUDY_TREATMENT);
      return _.reduce(structuredLines, function(accum, line) {
        var covariates = _.reduce(line, function(accum, value, key) {
          if (!_.includes(standardProperties, key)) {
            accum[key] = value;
          }
          return accum;
        }, {});
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
        errorColumn = _.find(covariateNames, function(covariateName) {
          if (covValues[covariateName] !== undefined && covValues[covariateName] && arm[covariateName] !== null && arm[covariateName] !== covValues[covariateName]) {
            return true;
          }
          covValues[covariateName] = arm[covariateName];
        });
        return errorColumn;
      });
      return errorColumn;
    }

    function checkConsistency(covariates) {
      var errorMessage = '';
      _.find(covariates, function(studyCovariates, key) {
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
            errorMessage = 'Non-numeric covariate: study ' + studyName + ', column ' + covariateName;
            return errorMessage;
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
        var arm = headerLine.reduce(function(accum, header, index) {
          accum[header] = line[index];
          return accum;
        }, {});
        arm.study = convertStudyValueToString(arm);
        // substitute treatment name with its ID
        arm.treatment = treatmentMap[arm.treatment];
        return arm;
      });

      function hasEntryColumn(entryCandidate) {
        return _.keys(entryCandidate).find(function(columnName) {
          return _.includes(ENTRY_COLUMN_OPTIONS, columnName);
        });
      }

      function isEntry(entryCandidate) {
        return !_.includes(_.values(entryCandidate), 'NA') && hasEntryColumn(entryCandidate);
      }

      function lineToEntry(line) {
        return _.pick(line, ENTRY_COLUMN_OPTIONS.concat(STUDY_TREATMENT));
      }

      function isRelativeEffect(line) {
        var entryCandidate = lineToEntry(line);
        return _.includes(_.values(entryCandidate), 'NA') || !hasEntryColumn(entryCandidate);
      }

      function lineToRelativeEffect(line) {
        return _.pick(line, RELATIVE_EFFECTS_COLUMN_OPTIONS.concat(STUDY_TREATMENT));
      }

      function addToRelativeEffectData(accum, entry) {
        function isNullOrNa(val) {
          return val === 'NA' || val === null;
        }
        function isBaseEntry(entry) {
          return isNullOrNa(entry['re.diff']) && isNullOrNa(entry['re.diff.se']);
        }

        if (!accum.data) {
          accum.data = {};
        }

        if (!accum.data[entry.study]) {
          accum.data[entry.study] = {
            otherArms: []
          };
        }

        if (isBaseEntry(entry)) {
          var baseArm = {
            treatment: entry.treatment
          };
          if (entry['re.base.se'] !== undefined) {
            baseArm.baseArmStandardError = entry['re.base.se'];
          }
          accum.data[entry.study].baseArm = baseArm;
        } else {
          accum.data[entry.study].otherArms.push({
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

      var relativeEffectEntries = structuredLines
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
