var proxyquire = require('proxyquire');
var request = require('supertest');

var chai = require('chai'),
  spies = require('chai-spies'),
  sinon = require('sinon'),
  expect = chai.expect;

chai.use(spies);
var analysisRepositoryStub = chai.spy.object(['get']);
var pataviTaskRepositoryStub = chai.spy.object(['create', 'get']);
var modelRepositoryStub = chai.spy.object(['get', 'setTaskId']);

var url = 'http://localhost:3001';

var pataviHandlers = proxyquire('../standalone-app/pataviHandlers', {
  './pataviTaskRepository': pataviTaskRepositoryStub,
  './modelRepository': modelRepositoryStub,
  './analysisRepository': analysisRepositoryStub
});

describe('analyses handlers', function() {
  describe('get patavi task', function() {
    beforeEach(function() {
      var mockModel = {
        taskid: 'taskid'
      };
      sinon.stub(analysisRepositoryStub, 'get').yields(mockModel);
    });
    it('should return a patavi uri if the model has a task defined', function(done) {
      var request = {
        session: {
          userId: 'userId'
        },
        params: {
          modelId: 'modelId'
        }
      },
      response = {};
      pataviHandlers.getPataviTask(request, response, done);
      expect(modelRepositoryStub.get).to.have.been.called();
    });
  });
});
