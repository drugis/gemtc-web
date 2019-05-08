'use strict';
var proxyquire = require('proxyquire');

var sinon = require('sinon');
var chai = require('chai');
var spies = require('chai-spies');
var expect = chai.expect;

chai.use(spies);
var modelRepositoryStub = chai.spy();
var modelBaselineRepositoryStub = chai.spy();
var pataviTaskRepositoryStub = chai.spy();

var modelHandlers = proxyquire('../standalone-app/modelHandlers', {
  './modelRepository': modelRepositoryStub,
  './modelBaselineRepository': modelBaselineRepositoryStub,
  './pataviTaskRepository': pataviTaskRepositoryStub,
});

var errorMessage = 'error';
var error500 = {
  statusCode: 500,
  message: errorMessage
};
var error404 = {
  statusCode: 404,
  message: errorMessage
};
var analysisId = 1;

describe('the model handlers', function() {
  describe('find', function() {
    var request = {
      params: {
        analysisId: 1
      }
    };

    it('should call next with an error object when an error occurs while retrieving models from the repository', function() {
      var response = {};
      var next = chai.spy();
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(errorMessage);
      modelHandlers.find(request, response, next);
      expect(next).to.have.been.called.with(error500);
    });

    it('should call next with an error object when an error occurs while gettig the status of Patavi tasks', function() {
      var response = {};
      var next = chai.spy();
      var modelsResult = [
        { taskUrl: 'taskUrl' }
      ];
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, modelsResult);
      pataviTaskRepositoryStub.getPataviTasksStatus = sinon.fake.yields(errorMessage);

      modelHandlers.find(request, response, next);
      expect(next).to.have.been.called.with(error500);
    });

    it('should call response.json with models with and without tasks', function() {
      var response = {
        json: chai.spy()
      };
      var next = chai.spy();
      var runStatus = 'done';
      var taskUrl = 'url';
      var expectedModelArray = [{
        taskUrl: taskUrl,
        runStatus: runStatus
      }];
      var modelsResult = [{
        taskUrl: taskUrl
      }];
      var pataviResult = [{
        id: taskUrl,
        runStatus: runStatus
      }];
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, modelsResult);
      pataviTaskRepositoryStub.getPataviTasksStatus = sinon.fake.yields(null, pataviResult);

      modelHandlers.find(request, response, next);
      expect(response.json).to.have.been.called.with(expectedModelArray);
    });

    it('should call response.json with models without tasks', function() {
      var response = {
        json: chai.spy()
      };
      var next = chai.spy();
      var expectedModelArray = [{}];
      var modelsResult = [{}];
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, modelsResult);

      modelHandlers.find(request, response, next);
      expect(response.json).to.have.been.called.with(expectedModelArray);
    });
  });

  describe('getResult', function() {
        var modelId = 1;
    var request = {
      params: {
        analysisId: analysisId,
        modelId: modelId
      }
    };
    var message = 'no result found for model with id ';
    var error = {
      statusCode: 404,
      message: message + modelId
    };

    it('should pass an error to next when attempting to get a model from the repository', function(done) {
      var response;
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      modelRepositoryStub.get = sinon.fake.yields(errorMessage);

      modelHandlers.getResult(request, response, next);
    });

    it('should pass an error to next when attempting to get results of model with no task', function(done) {
      var response;
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      var modelResult = {};
      modelRepositoryStub.get = sinon.fake.yields(null, modelResult);

      modelHandlers.getResult(request, response, next);
    });

    it('should pass an error to next when attempting to get patavi result', function(done) {
      var response;
      var taskUrl = 'url';
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      var modelResult = {
        taskUrl: taskUrl
      };
      modelRepositoryStub.get = sinon.fake.yields(null, modelResult);
      pataviTaskRepositoryStub.getResult = sinon.fake.yields(errorMessage);

      modelHandlers.getResult(request, response, next);
    });

    it('should call response.status with 200 and response.json with the patavi result', function(done) {
      var pataviResult = {};
      var next = chai.spy();
      var expectations = function(result) {
        expect(response.status).to.have.been.called.with(200);
        expect(result).to.deep.equal(pataviResult);
        expect(next).to.not.have.been.called();
        done();
      };
      var response = {
        status: chai.spy(),
        json: expectations
      };
      var taskUrl = 'url';
      var modelResult = {
        taskUrl: taskUrl
      };
      modelRepositoryStub.get = sinon.fake.yields(null, modelResult);
      pataviTaskRepositoryStub.getResult = sinon.fake.yields(null, pataviResult);

      modelHandlers.getResult(request, response, next);
    });
  });

  describe('createModel', function() {
        var request = {
      params: {
        analysisId: analysisId
      },
      body: {}
    };

    it('should call the repository to create a new model', function(done) {
      var modelId = -1;
      var next = chai.spy();
      var expectations = function(returnId) {
        expect(returnId).to.deep.equal({
          id: modelId
        });
        expect(response.location).to.have.been.called.with('/analyses/' + analysisId + '/models/' + modelId);
        expect(response.status).to.have.been.called.with(201);
        done();
      };
      var response = {
        location: chai.spy(),
        status: chai.spy(),
        json: expectations
      };

      modelRepositoryStub.create = sinon.fake.yields(null, modelId);
      modelHandlers.createModel(request, response, next);
    });

    it('should call next with an error if the model can\'t be created', function(done) {
      var error = {
        statusCode: 404,
        message: 'Error creating model for analysis: ' + analysisId
      };
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      var response = {};
      modelRepositoryStub.create = sinon.fake.yields(errorMessage);
      modelHandlers.createModel(request, response, next);
    });
  });

  describe('getBaseline', function() {
    var request = {
      params: {
        modelId: 1
      }
    };

    it('should query the modelBaseline repository', function() {
      var response = {
        json: chai.spy()
      };
      var next = chai.spy();
      var result = { rows: [] };
      modelBaselineRepositoryStub.get = sinon.fake.yields(null, result);
      modelHandlers.getBaseline(request, response, next);
      expect(response.json).to.have.been.called.with(result);
      expect(next).to.not.have.been.called();
    });

    it('should, if an error occurs, pass it to next', function() {
      var response = {};
      var next = chai.spy();
      modelBaselineRepositoryStub.get = sinon.fake.yields(errorMessage);
      modelHandlers.getBaseline(request, response, next);

      expect(next).to.have.been.called.with(error500);
    });
  });

  describe('setBaseline', function() {
    var modelId = 1;
    var request = {
      params: {
        analysisId: -1,
        modelId: modelId
      },
      body: {}
    };

    it('should query the modelBaseline repository', function(done) {
      var response = {
        sendStatus: function(result) {
          expect(result).to.equal(200);
          done();
        }
      };
      var next = chai.spy();
      var model = {
        analysisId: -1
      };
      modelRepositoryStub.get = sinon.fake.yields(null, model);
      modelBaselineRepositoryStub.set = sinon.fake.yields(null);
      modelHandlers.setBaseline(request, response, next);
      expect(next).to.not.have.been.called();
    });

    it('should, if an illegal analysis, model combination occurs pass an error to next', function(done) {
      var message = 'Error, could not find analysis/model combination';
      var error = {
        statusCode: 404,
        message: message
      };
      var response = {};
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      modelRepositoryStub.get = sinon.fake.yields(null, 'someModel');
      modelBaselineRepositoryStub.get = sinon.fake.yields(message);
      modelHandlers.setBaseline(request, response, next);
    });

    it('should, if the model cant be gotten pass an error to next', function(done) {
      var response = {};
      var message = 'Error setting baseline for model: ' + modelId;
      var error = {
        statusCode: 404,
        message: message
      };
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error);
        done();
      };
      modelRepositoryStub.get = sinon.fake.yields(message);
      modelHandlers.setBaseline(request, response, next);
    });
  });

  describe('setTitle', function() {
    var request = {
      params: {
        modelId: 1
      },
      body: {
        newTitle: 'newTitle'
      }
    };

    it('should call the repository.setTitle', function() {
      var response = {
        sendStatus: chai.spy()
      };
      var next = chai.spy();
      modelRepositoryStub.setTitle = sinon.fake.yields(null);
      modelHandlers.setTitle(request, response, next);
      expect(response.sendStatus).to.have.been.called.with(200);
    });

    it('should call next with an error if one occurs', function() {
      var response = {};
      var next = chai.spy();
      modelRepositoryStub.setTitle = sinon.fake.yields(errorMessage);
      modelHandlers.setTitle(request, response, next);
      expect(next).to.have.been.called.with(error500);
    });
  });
});
