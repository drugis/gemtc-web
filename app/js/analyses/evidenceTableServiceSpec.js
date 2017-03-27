'use strict';
define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('The evidence service', function() {

    var evidenceTableService;


    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function(EvidenceTableService) {
      evidenceTableService = EvidenceTableService;
    }));

    describe('studyMapToStudyArray', function() {
      var studyMap = {
        'Study1': {
          arms: {
            'Treatment1': {
              "responders": 58,
              "sampleSize": 100
            },
            'Treatment2': {
              "responders": 53,
              "sampleSize": 103
            }
          }
        },
        'Study2': {
          arms: {
            'Treatment1': {
              "responders": 58,
              "sampleSize": 100
            },
            'Treatment2': {
              "responders": 53,
              "sampleSize": 103
            }
          }
        }
      };
      var studyArray;

      beforeEach(inject(function() {
        studyArray = evidenceTableService.studyMapToStudyArray(studyMap);
      }));

      it('create a list of study objects from the studyMap', function() {
        expect(studyArray.length).toEqual(2);
        expect(studyArray[0].title).toBeDefined();
        expect(studyArray[0].arms).toBeDefined();
        expect(studyArray[0].arms.length).toEqual(2);
        expect(studyArray[0].arms[0].title).toBeDefined();
        expect(studyArray[0].arms[0].data).toBeDefined();
      });
    });

    describe('studyListToEvidenceRows with no covariates', function() {

      var studyList = [{
        title: 'title1',
        arms: [{
          title: 'arm1',
          data: {
            responders: 10,
            sampleSize: 20,
            mean: 5.5,
            'std.dev': 0.001,
            'std.err': 0.002
          }
        }, {
          title: 'arm2',
          data: {
            mean: 5.5,
          }
        }]
      }, {
        title: 'title2',
        arms: [{
          title: 'arm3',
          data: {
            mean: 5.5,
          }
        }]
      }];
      var evidenceRows;

      beforeEach(function() {
        evidenceRows = evidenceTableService.studyListToEvidenceRows(studyList);
      });

      it('should create a list of evidenceRows from a list of study objects', function() {
        expect(evidenceRows.length).toEqual(3);
        expect(evidenceRows[0].studyTitle).toBe(studyList[0].title);
        expect(evidenceRows[0].studyRowSpan).toBe(2);
        expect(evidenceRows[0].treatmentTitle).toBe(studyList[0].arms[0].title);
        expect(evidenceRows[0].evidence).toEqual({
          responders: 10,
          sampleSize: 20,
          mean: 5.5,
          stdDev: 0.001,
          stdErr: 0.002
        });
        expect(evidenceRows[0].showStudyColumn).toBeDefined();

        expect(evidenceRows[0].evidence.responders).toEqual(10);
        expect(evidenceRows[0].evidence.sampleSize).toEqual(20);
        expect(evidenceRows[0].evidence.mean).toEqual(5.5);
        expect(evidenceRows[0].evidence.stdDev).toEqual(0.001);
      });
    });

    describe('studyListToEvidenceRows with covariates', function() {

      var studyList = [{
        title: 'title1',
        arms: [{
          title: 'arm1',
          data: {
            responders: 10,
            sampleSize: 20,
            mean: 5.5,
            'std.dev': 0.001
          }
        }, {
          title: 'arm2',
          data: {
            responders: 10,
            sampleSize: 20,
            mean: 5.5,
            'std.dev': 0.001
          }
        }]
      }, {
        title: 'title2',
        arms: [{
          title: 'arm3',
          data: {
            responders: 10,
            sampleSize: 20,
            mean: 5.5,
            'std.dev': 0.001
          }
        }]
      }];
      var studyLevelCovariates = {
        title1: {
          'SOME_COVARIATE_1': 1,
          'SOME_COVARIATE_2': 2
        },
        title2: {
          'SOME_COVARIATE_1': 3,
          'SOME_COVARIATE_2': 4
        }
      };
      var evidenceRows;

      beforeEach(function() {
        evidenceRows = evidenceTableService.studyListToEvidenceRows(studyList, studyLevelCovariates);
      });

      it('create a list of evidenceRows from a list of study objects', function() {
        var expectedFirstCovariates = [{
          data: 1,
          headerTitle: 'SOME_COVARIATE_1'
        }, {
          data: 2,
          headerTitle: 'SOME_COVARIATE_2'
        }];
        expect(evidenceRows.length).toEqual(3);
        expect(evidenceRows[0].studyTitle).toBeDefined();
        expect(evidenceRows[0].studyRowSpan).toBeDefined();
        expect(evidenceRows[0].treatmentTitle).toBeDefined();
        expect(evidenceRows[0].evidence).toBeDefined();
        expect(evidenceRows[0].showStudyColumn).toBeDefined();

        expect(evidenceRows[0].evidence.responders).toEqual(10);
        expect(evidenceRows[0].evidence.sampleSize).toEqual(20);
        expect(evidenceRows[0].evidence.mean).toEqual(5.5);
        expect(evidenceRows[0].evidence.stdDev).toEqual(0.001);

        expect(evidenceRows[0].covariatesColumns).toBeDefined();
        expect(evidenceRows[0].covariatesColumns.length).toBe(2);
        expect(evidenceRows[0].covariatesColumns).toEqual(expectedFirstCovariates);
      });
    });

    describe('determineOutcomeType', function() {

      it('should return dichotomous if the first arm in the first study has responders', function() {
        var studyList = [{
          title: 'title1',
          arms: [{
            title: 'arm1',
            data: {
              responders: 10,
              sampleSize: 20
            }
          }, {
            title: 'arm2',
            data: {}
          }]
        }, {
          title: 'title2',
          arms: [{
            title: 'arm3',
            data: {}
          }]
        }];
        var outcomeType;
        outcomeType = evidenceTableService.determineOutcomeType(studyList);
        expect(outcomeType).toEqual('dichotomous');
      });

      it('should return continuous if the first arm in the first study has no responders', function() {
        var studyList = [{
          title: 'title1',
          arms: [{
            title: 'arm1',
            data: {
              mean: 10,
              sampleSize: 20
            }
          }, {
            title: 'arm2',
            data: {}
          }]
        }, {
          title: 'title2',
          arms: [{
            title: 'arm3',
            data: {}
          }]
        }];
        var outcomeType;
        outcomeType = evidenceTableService.determineOutcomeType(studyList);
        expect(outcomeType).toEqual('continuous');
      });
    });


    describe('buildTableRows', function() {

      it('should build the table rows', function() {
        var problem = {
          'entries': [{
            'study': 'Rudolph and Feiger, 1999',
            'treatment': 2,
            'responders': 58,
            'sampleSize': 100
          }, {
            'study': 'Rudolph and Feiger, 1999',
            'treatment': 3,
            'responders': 53,
            'sampleSize': 103
          }, {
            'study': 'De Wilde et al, 1993',
            'treatment': 3,
            'responders': 24,
            'sampleSize': 37
          }, {
            'study': 'De Wilde et al, 1993',
            'treatment': 2,
            'responders': 25,
            'sampleSize': 41
          }],
          'treatments': [{
            'id': 2,
            'name': 'Fluoxetine'
          }, {
            'id': 3,
            'name': 'Paroxetine'
          }, {
            'id': 4,
            'name': 'Sertraline'
          }],
          relativeEffectData: {
            scale: "log odds ratio",
            data: {
              'Schone and Ludwig, 1993': {
                baseArm: {
                  treatment: 2
                },
                otherArms: [{
                  treatment: 3,
                  meanDifference: 0.39,
                  standardError: 0.02
                }]
              },
              'Aberg-Wistedt et al, 2000': {
                baseArm: {
                  treatment: 3,
                  baseArmStandardError: 0.23
                },
                otherArms: [{
                  treatment: 2,
                  meanDifference: 0.33,
                  standardError: 0.03
                }, {
                  treatment: 4,
                  meanDifference: 0.35,
                  standardError: 0.04
                }]
              }
            }
          },
          'studyLevelCovariates': {
            'De Wilde et al, 1993': {
              'LENGTH_OF_FOLLOW_UP': 10,
              'BLINDING_AT_LEAST_DOUBLE_BLIND': 1
            },
            'Schone and Ludwig, 1993': {
              'LENGTH_OF_FOLLOW_UP': 20,
              'BLINDING_AT_LEAST_DOUBLE_BLIND': 1
            },
            'Rudolph and Feiger, 1999': {
              'LENGTH_OF_FOLLOW_UP': 25,
              'BLINDING_AT_LEAST_DOUBLE_BLIND': 0
            },
            'Aberg-Wistedt et al, 2000': {
              'LENGTH_OF_FOLLOW_UP': 30,
              'BLINDING_AT_LEAST_DOUBLE_BLIND': 0
            }
          }
        };
        var expectedFirstBaseRow = {
          studyTitle: 'Schone and Ludwig, 1993',
          treatmentTitle: 'Fluoxetine',
          baseArmStandardError: undefined,
          studyRowSpan: 2,
          showStudyColumn: true,
          covariatesColumns: [{
            data: 20,
            headerTitle: 'LENGTH_OF_FOLLOW_UP'
          }, {
            data: 1,
          headerTitle: 'BLINDING_AT_LEAST_DOUBLE_BLIND'
          }]
        };

        var expecetdFirstOtherArmRow = {
          studyTitle: 'Schone and Ludwig, 1993',
          treatmentTitle: 'Paroxetine',
          meanDifference: 0.39,
          standardError: 0.02,
          studyRowSpan: 2,
          showStudyColumn: false,
          covariatesColumns: [{
            data: 20,
            headerTitle: 'LENGTH_OF_FOLLOW_UP'
          }, {
            data: 1,
            headerTitle: 'BLINDING_AT_LEAST_DOUBLE_BLIND'
          }]
        };

        var tableRows = evidenceTableService.buildRelativeEffectDataRows(problem);
        expect(tableRows.length).toBe(5);
        expect(tableRows[0]).toEqual(expectedFirstBaseRow);
        expect(tableRows[1]).toEqual(expecetdFirstOtherArmRow);
      });

    });

  });
});
