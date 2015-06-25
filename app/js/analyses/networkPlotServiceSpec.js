define(['angular', 'angular-mocks', 'analyses/analyses'], function() {
  describe('The networkplot service', function() {

    var networkPlotService;


    beforeEach(module('gemtc.analyses'));

    beforeEach(inject(function(NetworkPlotService) {
      networkPlotService = NetworkPlotService;
    }));

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
        },{
          "study": "Study2",
          "treatment": 1,
          "responders": 54,
          "sampleSize": 99
        },
        {
          "study": "Study2",
          "treatment": 3,
          "responders": 90,
          "sampleSize": 109
        },
        {
          "study": "Study3",
          "treatment": 2,
          "responders": 54,
          "sampleSize": 99
        },
        {
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
        },
        {
          "id": 3,
          "name": "Treatment3"
        }]
      }

      beforeEach(inject(function() {
        network = networkPlotService.transformProblemToNetwork(problem)
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

  });
});