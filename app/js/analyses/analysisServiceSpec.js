define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('The analysis service', function() {

    var analysisService;


    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function(AnalysisService) {
      analysisService = AnalysisService;
    }));

    describe('problemToStudyMap', function() {

      var problem = {
        "entries": [{
          "study": "Study1",
          "treatment": 1,
          "responders": 58,
          "sampleSize": 100
        }, {
          "study": "Study1",
          "treatment": 2,
          "responders": 53,
          "sampleSize": 103
        }, {
          "study": "Study2",
          "treatment": 1,
          "responders": 58,
          "sampleSize": 100
        }, {
          "study": "Study2",
          "treatment": 2,
          "responders": 53,
          "sampleSize": 103
        }],
        "treatments": [{
          "id": 1,
          "name": "Treatment1"
        }, {
          "id": 2,
          "name": "Treatment2"
        }]
      };

      var expextredStudyMap = {
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
      }
      var studyMap;

      beforeEach(inject(function() {
        studyMap = analysisService.problemToStudyMap(problem);
      }));

      it('generate a map of studies with arms', function() {
        expect(studyMap['Study1']).toBeDefined();
        expect(studyMap['Study1'].arms['Treatment1']).toBeDefined();
        expect(studyMap['Study1'].arms['Treatment2']).toBeDefined();

        expect(studyMap).toEqual(expextredStudyMap);
      });

    })

  });
});