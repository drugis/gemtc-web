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
            'std.dev': 0.001
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
      var evidenceRows;

      beforeEach(function() {
        evidenceRows = evidenceTableService.studyListToEvidenceRows(studyList);
      });

      it('create a list of evidenceRows from a list of study objects', function() {
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
          data: {}
        }]
      }, {
        title: 'title2',
        arms: [{
          title: 'arm3',
          data: {}
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

  });
});