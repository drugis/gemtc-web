'use strict';
var proxyquire = require('proxyquire');

var sinon = require('sinon');
var chai = require('chai');
var spies = require('chai-spies');
var expect = chai.expect;

chai.use(spies);
var analysisRepositoryStub = chai.spy();
var modelRepositoryStub = chai.spy();
var pataviTaskRepositoryStub = chai.spy();
var modelServiceStub = chai.spy();

var analysisHandlers = proxyquire('../standalone-app/analysisHandlers', {
  './analysisRepository': analysisRepositoryStub,
  './modelRepository': modelRepositoryStub,
  './pataviTaskRepository': pataviTaskRepositoryStub,
  './modelService': modelServiceStub
});

var error = 'error';

function expectError(next) {
  expect(next).to.have.been.called.with({
    statusCode: 500,
    message: error
  });
}

describe('analyses handlers', function() {
  describe('queryAnalyses', function() {
    var request = {
      user: {
        id: 'userId'
      }
    };

    it('should query the analyses repository', function() {
      var response = {
        json: chai.spy()
      };
      var next = chai.spy();
      var result = { rows: [] };
      analysisRepositoryStub.query = sinon.fake.yields(undefined, result);
      analysisHandlers.queryAnalyses(request, response, next);

      expect(response.json).to.have.been.called.with(result.rows);
      expect(next).to.not.have.been.called();
    });

    it('should if an error occurs pass it to next', function() {
      var response = {};
      var next = chai.spy();
      analysisRepositoryStub.query = sinon.fake.yields('error');
      analysisHandlers.queryAnalyses(request, response, next);

      expectError(next);
    });
  });

  describe('getAnalysis', function() {
    var request = {
      params: {
        analysisId: 1
      }
    };

    it('should get analysis given an id', function() {
      var response = {
        json: chai.spy()
      };
      var next = chai.spy();
      var analysis = {};
      analysisRepositoryStub.get = sinon.fake.yields(undefined, analysis);
      analysisHandlers.getAnalysis(request, response, next);
      expect(response.json).to.have.been.called.with(analysis);
      expect(next).to.not.have.been.called();
    });

    it('should if an error occurs pass it to next', function() {
      var response = {};
      var next = chai.spy();
      analysisRepositoryStub.get = sinon.fake.yields('error');
      analysisHandlers.getAnalysis(request, response, next);

      expectError(next);
    });
  });

  describe('createAnalysis', function() {
    var request = {
      user: {
        id: 1
      },
      body: 'body'
    };

    it('should create analysis', function() {
      var response = {
        location: chai.spy(),
        sendStatus: chai.spy()
      };
      var next = chai.spy();
      var newAnalysisId = 1;
      analysisRepositoryStub.create = sinon.fake.yields(undefined, newAnalysisId);
      analysisHandlers.createAnalysis(request, response, next);

      expect(response.location).to.have.been.called.with('/analyses/' + newAnalysisId);
      expect(response.sendStatus).to.have.been.called.with(201);
      expect(next).to.not.have.been.called();
    });

    it('should if an error occurs pass it to next', function() {
      var response = {};
      var next = chai.spy();
      analysisRepositoryStub.create = sinon.fake.yields('error');
      analysisHandlers.createAnalysis(request, response, next);

      expectError(next);
    });
  });

  describe('setPrimaryModel', function() {
    var request = {
      params: {
        analysisId: 1
      },
      query: {
        modelId: 1
      }
    };

    it('should set the primary model', function() {
      var response = {
        location: chai.spy(),
        sendStatus: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.setPrimaryModel = sinon.fake.yields(undefined);
      analysisHandlers.setPrimaryModel(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(200);
      expect(next).to.not.have.been.called();
    });

    it('should if an error occurs pass it to next', function() {
      var response = {};
      var next = chai.spy();
      analysisRepositoryStub.setPrimaryModel = sinon.fake.yields('error');
      analysisHandlers.setPrimaryModel(request, response, next);

      expectError(next);
    });
  });

  describe('getProblem', function() {
    var request = {
      params: {
        analysisId: 1
      }
    };

    it('should get the problem', function() {
      var response = {
        json: chai.spy()
      };
      var result = {
        problem: ''
      };
      var next = chai.spy();
      analysisRepositoryStub.get = sinon.fake.yields(undefined, result);
      analysisHandlers.getProblem(request, response, next);

      expect(response.json).to.have.been.called.with(result.problem);
      expect(next).to.not.have.been.called();
    });

    it('should if an error occurs pass it to next', function() {
      var response = {};
      var next = chai.spy();
      analysisRepositoryStub.get = sinon.fake.yields('error');
      analysisHandlers.getProblem(request, response, next);

      expectError(next);
    });
  });

  describe('setTitle', function() {
    var request = {
      params: {
        analysisId: 1
      },
      body: {
        newTitle: 'newTitle'
      }
    };

    it('should update the analysis title', function() {
      var response = {
        sendStatus: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.setTitle = sinon.fake.yields();

      analysisHandlers.setTitle(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(200);
      expect(next).to.not.have.been.called();
    });

    it('should if an error occurs pass it to next', () => {
      var response = {};
      var next = chai.spy();
      analysisRepositoryStub.setTitle = sinon.fake.yields('error');

      analysisHandlers.setTitle(request, response, next);

      expectError(next);
    });
  });

  describe('setOutcome', function() {
    var request = {
      params: {
        analysisId: 1
      },
      body: {
        name: 'newName',
        direction: -1
      }
    };

    it('should update the outcome of the analysis', function() {
      var response = {
        sendStatus: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.setOutcome = sinon.fake.yields();

      analysisHandlers.setOutcome(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(200);
      expect(next).to.not.have.been.called();
    });

    it('should if an error occurs pass it to next', () => {
      var response = {};
      var next = chai.spy();
      analysisRepositoryStub.setOutcome = sinon.fake.yields('error');

      analysisHandlers.setOutcome(request, response, next);

      expectError(next);
    });
  });

  describe('deleteAnalysis', function() {
    var request = {
      params: {
        analysisId: 1
      }
    };

    it('should call the repository function responsible for deletion', () => {
      var response = {
        sendStatus: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.deleteAnalysis = sinon.fake.yields();

      analysisHandlers.deleteAnalysis(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(200);
      expect(next).to.not.have.been.called();
    });

    it('should if an error occurs pass it to next', () => {
      var response = {};
      var next = chai.spy();
      analysisRepositoryStub.deleteAnalysis = sinon.fake.yields('error');

      analysisHandlers.deleteAnalysis(request, response, next);

      expectError(next);
    });
  });

  describe('setProblem', function() {
    var request = {
      params: {
        analysisId: 1
      },
      body: {}
    };
    var errorMessage = 'error';
    var error = {
      message: errorMessage,
      statusCode: 500
    };
    var modelsWithTasks = {
      modelsWithTask: [{
        taskUrl: 'taskUrl',
        id: 37
      }]
    };
    var models = [];
    var response = {};

    it('should call the repository function responsible for updating the analysis problem', (done) => {
      var response = {
        sendStatus: function(code) {
          expect(code).to.equal(200);
          expect(next).to.not.have.been.called();
          done();
        }
      };
      var next = chai.spy();
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, models);
      modelServiceStub.partitionModels = sinon.fake.returns(modelsWithTasks);
      pataviTaskRepositoryStub.deleteTask = sinon.fake.yields(null);
      modelRepositoryStub.setTaskUrl = sinon.fake.yields(null);
      analysisRepositoryStub.setProblem = sinon.fake.yields(null);

      analysisHandlers.setProblem(request, response, next);
    });

    it('should call next with an error if modelRepository.findByAnalysis fails', (done) => {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(errorMessage);
      analysisHandlers.setProblem(request, response, next);
    });

    it('should call next with an error if pataviTaskRepositoryStub.deleteTask fails', (done) => {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, models);
      modelServiceStub.partitionModels = sinon.fake.returns(modelsWithTasks);
      pataviTaskRepositoryStub.deleteTask = sinon.fake.yields(errorMessage);

      analysisHandlers.setProblem(request, response, next);
    });

    it('should call next with an error if modelRepositoryStub.setTaskUrl fails', (done) => {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, models);
      modelServiceStub.partitionModels = sinon.fake.returns(modelsWithTasks);
      pataviTaskRepositoryStub.deleteTask = sinon.fake.yields(null);
      modelRepositoryStub.setTaskUrl = sinon.fake.yields(errorMessage);

      analysisHandlers.setProblem(request, response, next);
    });

    it('should call next with an error if analysisRepositoryStub.setProblem fails', (done) => {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, models);
      modelServiceStub.partitionModels = sinon.fake.returns(modelsWithTasks);
      pataviTaskRepositoryStub.deleteTask = sinon.fake.yields(null);
      modelRepositoryStub.setTaskUrl = sinon.fake.yields(null);
      analysisRepositoryStub.setProblem = sinon.fake.yields(errorMessage);

      analysisHandlers.setProblem(request, response, next);
    });

  });

});
