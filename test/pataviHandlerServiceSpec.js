'use strict';
var proxyquire = require('proxyquire');
var chai = require('chai'),
  spies = require('chai-spies'),
  expect = chai.expect,
  _ = require('lodash');

chai.use(spies);

var pataviTaskRepositoryStub;
var pataviHandlerService;

describe('the patavi handler service', function() {
  describe('createPataviTask', function() {
    beforeEach(function() {
      pataviTaskRepositoryStub = chai.spy.object(['create']);
      pataviHandlerService = proxyquire('../standalone-app/pataviHandlerService', {
        './pataviTaskRepository': pataviTaskRepositoryStub
      });
    });
    it('for network models should simply create the task', function() {
      var analysisMock = {
        problem: {
          entries: [],
          treatments: []
        },
        outcome: {

        }
      };
      var modelMock = {
        linearModel: 'random',
        modelType: {
          type: 'network'
        }
      };
      var callback = function() {};
      var expected = _.extend(analysisMock.problem, _.pick(modelMock, ['linearModel', 'modelType']));

      pataviHandlerService.createPataviTask(analysisMock, modelMock, callback);

      expect(pataviTaskRepositoryStub.create).to.have.been.called.with(expected, callback);
    });
    it('for leave one out models should omit the omitted study', function() {
      var analysisMock = {
        problem: {
          entries: [{
            treatment: 1,
            study: 'study 1'
          }, {
            treatment: 2,
            study: 'study 2'
          }, {
            treatment: 3,
            study: 'study 3'
          }],
          treatments: [{
            id: 1,
            name: 'treatment1'
          }, {
            id: 2,
            name: 'treatment2'
          }]
        },
        outcome: {
          direction: -1
        }
      };
      var modelMock = {
        linearModel: 'random',
        modelType: {
          type: 'network'
        },
        sensitivity: {
          omittedStudy: 'study 2'
        }
      };

      var expected = {
        entries: [{
          treatment: 1,
          study: 'study 1'
        }, {
          treatment: 3,
          study: 'study 3'
        }],
        treatments: [{
          id: 1,
          name: 'treatment1'
        }, {
          id: 2,
          name: 'treatment2'
        }],
        linearModel: 'random',
        modelType: {
          type: 'network'
        },
        sensitivity: {
          omittedStudy: 'study 2'
        },
        preferredDirection: -1
      };

      var callback = function() {};
      pataviHandlerService.createPataviTask(analysisMock, modelMock, callback);

      expect(pataviTaskRepositoryStub.create).to.have.been.called.with(expected, callback);
    });
    it('for pairwise models should reduce the problem to those studies and treatments specified', function() {
      var analysisMock = {
        problem: {
          entries: [{
            treatment: 1
          }, {
            treatment: 2
          }, {
            treatment: 3
          }],
          treatments: [{
            id: 1,
            name: 'treatment1'
          }, {
            id: 2,
            name: 'treatment2'
          }, {
            id: 3,
            name: 'treatment3'
          }]
        },
        outcome: {

        }
      };
      var modelMock = {
        linearModel: 'random',
        modelType: {
          type: 'pairwise',
          details: {
            from: {
              name: 'treatment1'
            },
            to: {
              name: 'treatment2'
            }
          }
        }
      };
      var expected = {
        entries: [{
          treatment: 1
        }, {
          treatment: 2
        }],
        treatments: [{
          id: 1,
          name: 'treatment1'
        }, {
          id: 2,
          name: 'treatment2'
        }],
        linearModel: 'random',
        modelType: {
          type: 'pairwise',
          details: {
            from: {
              name: 'treatment1'
            },
            to: {
              name: 'treatment2'
            }
          }
        },
        preferredDirection: 1
      };

      var callback = function() {};
      pataviHandlerService.createPataviTask(analysisMock, modelMock, callback);

      expect(pataviTaskRepositoryStub.create).to.have.been.called.with(expected, callback);
    });
  });
});
