define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('The analysis service', function() {

    var q,
      analysisService;


    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function($rootScope, $q, AnalysisService) {
      rootScope = $rootScope;
      q = $q;
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

      var expextedStudyMap = {
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
      var studyMap;

      beforeEach(inject(function() {
        studyMap = analysisService.problemToStudyMap(problem);
      }));

      it('generate a map of studies with arms', function() {
        expect(studyMap.Study1).toBeDefined();
        expect(studyMap.Study1.arms.Treatment1).toBeDefined();
        expect(studyMap.Study1.arms.Treatment2).toBeDefined();

        expect(studyMap).toEqual(expextedStudyMap);
      });
    });

    describe('transformProblemToNetwork', function() {

      var network;
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
          "responders": 54,
          "sampleSize": 99
        }, {
          "study": "Study2",
          "treatment": 3,
          "responders": 90,
          "sampleSize": 109
        }, {
          "study": "Study3",
          "treatment": 2,
          "responders": 54,
          "sampleSize": 99
        }, {
          "study": "Study3",
          "treatment": 3,
          "responders": 90,
          "sampleSize": 109
        }],
        "treatments": [{
          "id": 1,
          "name": "Treatment1"
        }, {
          "id": 2,
          "name": "Treatment2"
        }, {
          "id": 3,
          "name": "Treatment3"
        }]
      };

      beforeEach(inject(function() {
        network = analysisService.transformProblemToNetwork(problem);
      }));

      it('should transfrom the problem object to a network of of interventions and  edges', function() {

        expect(network.interventions).toBeDefined();
        expect(network.interventions.length).toEqual(3);
        expect(network.interventions[0].name).toBeDefined();
        expect(network.interventions[0].sampleSize).toBeDefined();

        expect(network.edges).toBeDefined();
        expect(network.edges[0].numberOfStudies).toBeDefined();
        expect(network.edges[0].numberOfStudies).toEqual(1);
        expect(network.edges[1].numberOfStudies).toEqual(1);
        expect(network.edges[2].numberOfStudies).toEqual(1);
      });
    });


    describe('createPairwiseOptions', function() {
      var options;
      var mockProblem = {
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
          "responders": 54,
          "sampleSize": 99
        }, {
          "study": "Study2",
          "treatment": 2,
          "responders": 90,
          "sampleSize": 109
        }, {
          "study": "Study3",
          "treatment": 2,
          "responders": 54,
          "sampleSize": 99
        }, {
          "study": "Study3",
          "treatment": 3,
          "responders": 90,
          "sampleSize": 109
        }],
        "treatments": [{
          "id": 1,
          "name": "Treatment1"
        }, {
          "id": 2,
          "name": "Treatment2"
        }, {
          "id": 3,
          "name": "Treatment3"
        }]
      };

      beforeEach(inject(function() {
        var analysisPromise = q.defer();
        options = analysisService.createPairwiseOptions(analysisPromise.promise);
        analysisPromise.resolve(mockProblem);
        rootScope.$apply();
      }));

      it('should create the options for pairwise comparisons from the analysis promise', function(done) {
        options.then(function(resolvedOptions) {
          expect(resolvedOptions.length).toBe(1);
          expect(resolvedOptions[0].label).toEqual('Treatment1 - Treatment2');
          done();
        });
        rootScope.$apply();
      });
    });

    describe('estimateRunLength for a network model', function() {
      var options;
      var problem = {
        entries: [{
          study: "Study1"
        }, {
          study: "Study1"
        }, {
          study: "Study2"
        }, {
          study: "Study2"
        }, {
          study: "Study2"
        }, {
          study: "Study3"
        }, {
          study: "Study3"
        }],
        treatments: [{
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }]
      };
      var model = {
        modelType: {
          type: 'network'
        },
        burnInIterations: 50000,
        inferenceIterations: 80000,
        thinningFactor: 5
      };

      beforeEach(inject(function() {
        var analysisPromise = q.defer();
        runLength = analysisService.estimateRunLength(analysisPromise.promise, model);
        analysisPromise.resolve(problem);
        rootScope.$apply();
      }));

      it('should estimate the run length from the problem and run length settings', function(done) {
        runLength.then(function(resultRunLength) {
          expect(resultRunLength).toBeCloseTo(40);
          done();
        });
        rootScope.$apply();
      });
    });


    describe('estimateRunLength for a pairwise model', function() {
      var options;
      var problem = {
        entries: [{
          study: "Study1",
          treatment: 1
        }, {
          study: "Study1",
          treatment: 2
        }, {
          study: "Study2",
          treatment: 1
        }, {
          study: "Study2",
          treatment: 2
        }, {
          study: "Study2",
          treatment: 3
        }, {
          study: "Study3",
          treatment: 1
        }, {
          study: "Study3",
          treatment: 3
        }],
        treatments: [{
          id: 1,
          name: 'treatment 1'
        }, {
          id: 2,
          name: 'treatment 2'
        }, {
          id: 3,
          name: 'treatment 3'
        }]
      };
      var model = {
        modelType: {
          type: 'pairwise',
          details: {
            from: 'treatment 1',
            to: 'treatment 2'
          }
        },
        burnInIterations: 50000,
        inferenceIterations: 80000,
        thinningFactor: 5
      };

      beforeEach(inject(function() {
        var analysisPromise = q.defer();
        runLength = analysisService.estimateRunLength(analysisPromise.promise, model);
        analysisPromise.resolve(problem);
        rootScope.$apply();
      }));

      it('should estimate the run length from the problem and run length settings', function(done) {
        runLength.then(function(resultRunLength) {
          expect(resultRunLength).toBeCloseTo(25.572);
          done();
        });
        rootScope.$apply();
      });
    });



  });
});
