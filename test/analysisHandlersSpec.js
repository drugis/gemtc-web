'use strict';
var proxyquire = require('proxyquire');

var sinon = require('sinon');
var chai = require('chai');
var spies = require('chai-spies');
var expect = chai.expect;

chai.use(spies);
var analysisRepositoryStub = chai.spy.object(['query', 'create', 'get']);

var analysisHandlers = proxyquire('../standalone-app/analysisHandlers', {
  './analysisRepository': analysisRepositoryStub
});

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
      expect(next).to.have.been.called();
    });

    it('should send back statuscode 500 if error occurs', function() {
      var response = {
        sendStatus: chai.spy(),
        end: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.query = sinon.fake.yields('error');
      analysisHandlers.queryAnalyses(request, response);

      expect(response.sendStatus).to.have.been.called.with(500);
      expect(response.end).to.have.been.called();
      expect(next).to.have.not.been.called();
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
      expect(next).to.have.been.called();
    });

    it('should send back statuscode 500 if error occurs', function() {
      var response = {
        sendStatus: chai.spy(),
        end: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.get = sinon.fake.yields('error');
      analysisHandlers.getAnalysis(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(500);
      expect(next).to.have.not.been.called();
      expect(response.end).to.have.been.called();
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
      expect(next).to.have.been.called();
    });

    it('should send back statuscode 500 if error occurs', function() {
      var response = {
        sendStatus: chai.spy(),
        end: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.create = sinon.fake.yields('error');
      analysisHandlers.createAnalysis(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(500);
      expect(next).to.have.not.been.called();
      expect(response.end).to.have.been.called();
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
      expect(next).to.have.been.called();
    });

    it('should send back statuscode 500 if error occurs', function() {
      var response = {
        sendStatus: chai.spy(),
        end: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.setPrimaryModel = sinon.fake.yields('error');
      analysisHandlers.setPrimaryModel(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(500);
      expect(next).to.have.not.been.called();
      expect(response.end).to.have.been.called();
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
      expect(next).to.have.been.called();
    });

    it('should send back statuscode 500 if error occurs', function() {
      var response = {
        sendStatus: chai.spy(),
        end: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.get = sinon.fake.yields('error');
      analysisHandlers.getProblem(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(500);
      expect(next).to.have.not.been.called();
      expect(response.end).to.have.been.called();
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
      expect(next).to.have.been.called();
    });

    it('should send back statuscode 500 if error occurs', () => {
      var response = {
        sendStatus: chai.spy(),
        end: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.setTitle = sinon.fake.yields('error');

      analysisHandlers.setTitle(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(500);
      expect(response.end).to.have.been.called();
      expect(next).to.have.not.been.called();
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
      expect(next).to.have.been.called();
    });

    it('should send back statuscode 500 if error occurs', () => {
      var response = {
        sendStatus: chai.spy(),
        end: chai.spy()
      };
      var next = chai.spy();
      analysisRepositoryStub.setOutcome = sinon.fake.yields('error');

      analysisHandlers.setOutcome(request, response, next);

      expect(response.sendStatus).to.have.been.called.with(500);
      expect(response.end).to.have.been.called();
      expect(next).to.have.not.been.called();
    });
  });
});
