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
var modelServiceStub = chai.spy();
var funnelPlotRepositoryStub = chai.spy();

var modelHandlers = proxyquire('../standalone-app/modelHandlers', {
  './modelRepository': modelRepositoryStub,
  './modelBaselineRepository': modelBaselineRepositoryStub,
  './pataviTaskRepository': pataviTaskRepositoryStub,
  './modelService': modelServiceStub,
  './funnelPlotRepository': funnelPlotRepositoryStub
});

var errorMessage = 'error message';
var error500 = {
  statusCode: 500,
  message: errorMessage
};
var error404 = {
  statusCode: 404,
  message: errorMessage
};
var coordinateError = {
  statusCode: 500,
  message: 'Error, could not find analysis/model combination'
};
var analysisId = 1;
var modelId = -1;

describe('the model handlers', function() {
  describe('find', function() {
    var request = {
      params: {
        analysisId: 1
      }
    };

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
      var partitionResult = {
        modelsWithTask: [modelsResult[0]],
        modelsWithoutTask: []
      };
      modelServiceStub.partitionModels = sinon.fake.returns(partitionResult);
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
      var partitionResult = {
        modelsWithTask: [],
        modelsWithoutTask: [modelsResult[0]]
      };
      modelServiceStub.partitionModels = sinon.fake.returns(partitionResult);
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, modelsResult);

      modelHandlers.find(request, response, next);
      expect(response.json).to.have.been.called.with(expectedModelArray);
    });

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
      var partitionResult = {
        modelsWithTask: [modelsResult[0]],
        modelsWithoutTask: []
      };
      modelServiceStub.partitionModels = sinon.fake.returns(partitionResult);
      modelRepositoryStub.findByAnalysis = sinon.fake.yields(null, modelsResult);
      pataviTaskRepositoryStub.getPataviTasksStatus = sinon.fake.yields(errorMessage);

      modelHandlers.find(request, response, next);
      expect(next).to.have.been.called.with(error500);
    });
  });

  describe('getResult', function() {
    var request = {
      params: {
        analysisId: analysisId,
        modelId: modelId
      }
    };
    var response;

    it('should pass an error to next when attempting to get a model from the repository', function(done) {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      modelRepositoryStub.get = sinon.fake.yields(errorMessage);

      modelHandlers.getResult(request, response, next);
    });

    it('should pass an error to next when attempting to get results of model with no task', function(done) {
      var noTaskError = {
        message: 'Error, model ' + modelId + ' does not have a task url',
        statusCode: 500
      };
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(noTaskError);
        done();
      };
      var modelResult = {};
      modelRepositoryStub.get = sinon.fake.yields(null, modelResult);

      modelHandlers.getResult(request, response, next);
    });

    it('should pass an error to next when attempting to get patavi result', function(done) {
      var taskUrl = 'url';
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
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
      var next = chai.spy();
      var expectations = function(returnId) {
        expect(returnId).to.deep.equal({
          id: modelId
        });
        expect(response.location).to.have.been.called.with('/analyses/' + analysisId + '/models/' + modelId);
        expect(response.status).to.have.been.called.with(201);
        expect(next).to.have.not.been.called();
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
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      var response = {};
      modelRepositoryStub.create = sinon.fake.yields(errorMessage);
      modelHandlers.createModel(request, response, next);
    });
  });

  describe('extendRunLength', function() {

    var request = {
      params: {
        analysisId: analysisId,
        modelId: modelId
      },
      body: {}
    };
    var model = {
      analysisId: analysisId,
      taskUrl: 'url'
    };

    it('should update an existing model to have more iterations and call response.sendStatus when successful', function(done) {
      var next = chai.spy();
      var expectations = function(status) {
        expect(status).to.equal(200);
        expect(next).to.have.not.been.called();
        done();
      };
      var response = {
        sendStatus: expectations
      };

      modelRepositoryStub.get = sinon.fake.yields(null, model);
      modelServiceStub.update = sinon.fake.yields(null);
      pataviTaskRepositoryStub.deleteTask = sinon.fake.yields(null);

      modelHandlers.extendRunLength(request, response, next);
    });

    it('should call next with an error if the model cannot be retrieved', function(done) {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      var response = {};
      modelRepositoryStub.get = sinon.fake.yields(errorMessage);

      modelHandlers.extendRunLength(request, response, next);
    });

    it('should call next with an error if the model cannot be updated', function(done) {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      var response = {};
      modelRepositoryStub.get = sinon.fake.yields(null, model);
      modelServiceStub.update = sinon.fake.yields(errorMessage);

      modelHandlers.extendRunLength(request, response, next);
    });

    it('should call next with an error if the task cannot be deleted', function(done) {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      var response = {};
      modelRepositoryStub.get = sinon.fake.yields(null, model);
      modelServiceStub.update = sinon.fake.yields(null);
      pataviTaskRepositoryStub.deleteTask = sinon.fake.yields(errorMessage);

      modelHandlers.extendRunLength(request, response, next);
    });

    it('should call next with an error if the coordinates do not match', function(done) {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(coordinateError);
        done();
      };
      var modelWithWrongAnalysis = {
        analysisId: 1337,
        taskUrl: 'url'
      };
      var response = {};
      modelRepositoryStub.get = sinon.fake.yields(null, modelWithWrongAnalysis);

      modelHandlers.extendRunLength(request, response, next);
    });
  });

  describe('addFunnelPlot', function() {

    var request = {
      params: {
        analysisId: analysisId,
        modelId: modelId
      },
      body: {}
    };

    var model = {
      analysisId: analysisId,
      taskUrl: 'url'
    };

    it('should add a funnel plot and call response.sendStatus when successful', function(done) {
      var next = chai.spy();
      var expectations = function(status) {
        expect(status).to.equal(201);
        expect(next).to.have.not.been.called();
        done();
      };
      var response = {
        sendStatus: expectations
      };

      modelRepositoryStub.get = sinon.fake.yields(null, model);
      funnelPlotRepositoryStub.create = sinon.fake.yields(null);

      modelHandlers.addFunnelPlot(request, response, next);
    });

    it('should call next with an error if the model cannot be retrieved', function(done) {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      var response = {};
      modelRepositoryStub.get = sinon.fake.yields(errorMessage);
      modelHandlers.addFunnelPlot(request, response, next);
    });

    it('should call next with an error if the funnel plot can not be created', function(done) {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      var response = {};
      modelRepositoryStub.get = sinon.fake.yields(null, model);
      funnelPlotRepositoryStub.create = sinon.fake.yields(errorMessage);
      modelHandlers.addFunnelPlot(request, response, next);
    });

    it('should call next with an error if the coordinates do not match', function(done) {
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(coordinateError);
        done();
      };
      var modelWithWrongAnalysis = {
        analysisId: 1337,
        taskUrl: 'url'
      };
      var response = {};
      modelRepositoryStub.get = sinon.fake.yields(null, modelWithWrongAnalysis);
      modelHandlers.addFunnelPlot(request, response, next);
    });
  });

  describe('queryFunnelPlots', function() {
    var request = {
      params: {
        modelId: modelId
      }
    };

    it('should query a funnel plot given a model id and call response.json with the result', function() {
      var response = {
        json: chai.spy()
      };
      var next = chai.spy();
      var result = {};
      funnelPlotRepositoryStub.findByModelId = sinon.fake.yields(null, result);
      modelHandlers.queryFunnelPlots(request, response, next);
      expect(response.json).to.have.been.called.with(result);
    });

    it('should call next with an error', function() {
      var response = {};
      var next = chai.spy();
      funnelPlotRepositoryStub.findByModelId = sinon.fake.yields(errorMessage);
      modelHandlers.queryFunnelPlots(request, response, next);
      expect(next).to.have.been.called.with(error500);
    });
  });

  describe('getFunnelPlot', function() {
    var request = {
      params: {
        plotId: -2
      }
    };

    it('should query a funnel plot given a model id and call response.json with the result', function() {
      var response = {
        json: chai.spy()
      };
      var next = chai.spy();
      var result = {};
      funnelPlotRepositoryStub.findByPlotId = sinon.fake.yields(null, result);
      modelHandlers.getFunnelPlot(request, response, next);
      expect(response.json).to.have.been.called.with(result);
    });

    it('should call next with an error', function() {
      var response = {};
      var next = chai.spy();
      funnelPlotRepositoryStub.findByPlotId = sinon.fake.yields(errorMessage);
      modelHandlers.getFunnelPlot(request, response, next);
      expect(next).to.have.been.called.with(error500);
    });
  });

  describe('setAttributes', function() {
    var request = {
      params: {
        analysisId: analysisId,
        modelId: modelId
      },
      body: {
        isArchived: false
      }
    };
    var model = {
      id: modelId,
      analysisId: analysisId
    };

    it('should set the model attributes and call response.sendStatus when successful', function(done) {
      var next = chai.spy();
      var expectations = function(status) {
        expect(status).to.equal(200);
        expect(next).to.not.have.been.called();
        done();
      };
      var response = {
        sendStatus: expectations
      };
      modelRepositoryStub.get = sinon.fake.yields(null, model);
      modelRepositoryStub.setArchive = sinon.fake.yields(null);
      modelHandlers.setAttributes(request, response, next);
    });

    it('should call next with an error if the model could not be retrieved', function(done) {
      var response;
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      modelRepositoryStub.get = sinon.fake.yields(errorMessage);
      modelHandlers.setAttributes(request, response, next);
    });

    it('should call next with an error if the archived status could not be set', function(done) {
      var response;
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(error500);
        done();
      };
      modelRepositoryStub.get = sinon.fake.yields(null, model);
      modelRepositoryStub.setArchive = sinon.fake.yields(errorMessage);
      modelHandlers.setAttributes(request, response, next);
    });

    it('should call next with an error if the coordinates do not match', function(done) {
      var response;
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(coordinateError);
        done();
      };
      var modelWithWrongAnalysis = {
        analysisId: 1337,
        modelId: modelId
      };
      modelRepositoryStub.get = sinon.fake.yields(null, modelWithWrongAnalysis);
      modelRepositoryStub.setArchive = sinon.fake.yields(errorMessage);
      modelHandlers.setAttributes(request, response, next);
    });
  });

  describe('getModel', function() {
    var request = {
      params: {
        modelId: 1
      }
    };
    it('should query the model repository and call response.json with the result', function() {
      var response = {
        json: chai.spy()
      };
      var next = chai.spy();
      var result = {};
      modelRepositoryStub.get = sinon.fake.yields(null, result);

      modelHandlers.getModel(request, response, next);
      expect(response.json).to.have.been.called.with(result);
      expect(next).to.not.have.been.called();
    });

    it('should, if an error occurs, pass it to next', function() {
      var response = {};
      var next = chai.spy();
      modelRepositoryStub.get = sinon.fake.yields(errorMessage);
      modelHandlers.getModel(request, response, next);

      expect(next).to.have.been.called.with(error404);
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

    it('should call next with an error if the coordinates do not match', function(done) {
      var response = {};
      var next = function(thrownError) {
        expect(thrownError).to.deep.equal(coordinateError);
        done();
      };
      modelRepositoryStub.get = sinon.fake.yields(null, 'someModel');
      modelBaselineRepositoryStub.get = sinon.fake.yields(errorMessage);
      modelHandlers.setBaseline(request, response, next);
    });

    it('should, if the model cant be gotten pass an error to next', function(done) {
      var response = {};
      var message = 'Error setting baseline for model: ' + modelId;
      var error = {
        statusCode: 500,
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
