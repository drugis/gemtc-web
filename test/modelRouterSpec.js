'use strict';
var assert = require('assert'),
  proxyquire = require('proxyquire'),
  httpStatus = require('http-status-codes'),
  sinon = require('sinon'),
  chai = require('chai'),
  session = require('express-session'),
  request = require('superagent'),
  express = require('express'),
  bodyParser = require('body-parser'),
  errorHandler = require('../standalone-app/errorHandler');

  chai.should();
var app = express();
var BASE_PATH = 'http://localhost:3999/analyses/';
var sessionOpts = {
  secret: 'secret',
  resave: false,
  saveUninitialized: true
};
var userId = 1;

var modelRepository = {},
  modelService = {},
  pataviTaskRepository = {},
  analysisRepository = {},
  funnelPlotRepository = {},
  modelBaselineRepository = {};

var modelRouter = proxyquire('../standalone-app/modelRouter', {
  './modelRepository': modelRepository,
  './modelService': modelService,
  './pataviTaskRepository': pataviTaskRepository,
  './analysisRepository': analysisRepository,
  './funnelPlotRepository': funnelPlotRepository,
  './modelBaselineRepository': modelBaselineRepository
});

describe('modelRouter', function() {
  var server;

  before(function() {
    server = app
      .use(bodyParser.json())
      .use(session(sessionOpts))
      .use(function(req, res, next) {
        req.user.id = userId;
        next();
      })
      .use('/analyses/:analysisId/models', modelRouter)
      .use(errorHandler)
      .listen(3999);
  });
  after(function() {
    server.close();
  });

  describe('GET request to /', function() {
    var taskUrl = 101;
    var taskUrl2 = 102;

    beforeEach(function() {
      var models = [{
        id: 1,
        title: 'model1'
      }, {
        id: 2,
        title: 'model2',
        taskUrl: taskUrl
      }, {
        id: 3,
        title: 'model3',
        taskUrl: taskUrl2
      }];

      var pataviTasks = [{
        id: taskUrl,
        runStatus: 'done'
      }, {
        id: taskUrl2
      }];

      sinon.stub(modelRepository, 'findByAnalysis').onCall(0).yields(null, models);
      sinon.stub(pataviTaskRepository, 'getPataviTasksStatus').onCall(0).yields(null, pataviTasks);
    });

    afterEach(function() {
      modelRepository.findByAnalysis.restore();
      pataviTaskRepository.getPataviTasksStatus.restore();
    });

    it('find all models', function(done) {
      var expectedResult = [{
        id: 2,
        title: 'model2',
        taskUrl: taskUrl,
        runStatus: 'done'
      }, {
        id: 3,
        title: 'model3',
        taskUrl: taskUrl2
      }];

      request('GET', BASE_PATH + '1/models/')
        .end(function(err, res) {
          res.should.have.property('status', httpStatus.OK);
          assert.deepEqual(expectedResult[0], res.body[0]);
          done();
        });
    });
  });
  describe('POST request to / with owner that is not the session user', function() {

    beforeEach(function() {
      var analysis = {
        owner: 399,
      };
      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
    });
    afterEach(function() {
      analysisRepository.get.restore();
    });

    it('should return FORBIDDEN', function(done) {
      var newModel = {};
      request
        .post(BASE_PATH + '1/models/')
        .send(newModel)
        .end(function(err, res) {
          assert(err);
          res.should.have.property('status', httpStatus.FORBIDDEN);
          done();
        });
    });
  });
  describe('POST request to / with owner that is the logged in user', function() {
    var createdId = 101;

    beforeEach(function() {
      var analysis = {
        owner: userId,
      };
      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
      sinon.stub(modelRepository, 'create').onCall(0).yields(null, createdId);
    });
    afterEach(function() {
      analysisRepository.get.restore();
      modelRepository.create.restore();
    });

    it('should create the model and have status CREATED', function(done) {
      var newModel = {};
      var expectedBody = {
        id: createdId
      };
      request
        .post(BASE_PATH + '1/models/')
        .send(newModel)
        .end(function(err, res) {
          assert(!err);
          res.should.have.property('status', httpStatus.CREATED);
          assert.equal('/analyses/1/models/' + createdId, res.headers.location);
          assert.deepEqual(expectedBody, res.body);
          done();
        });
    });
  });
  describe('GET request to /:modelID', function() {
    var model = {
      id: 2
    };
    beforeEach(function() {
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
    });
    afterEach(function() {
      modelRepository.get.restore();
    });
    it('should return the model with that ID', function(done) {
      request
        .get(BASE_PATH + '1/models/' + model.id)
        .end(function(err, res) {
          assert(!err);
          res.should.have.property('status', httpStatus.OK);
          assert.deepEqual(model, res.body);
          done();
        });
    });
  });
  describe('GET request to /:modelID/result', function() {
    var model = {
      id: 2,
      taskUrl: 3
    };
    var result = {
      results: 'something'
    };
    beforeEach(function() {
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
      sinon.stub(pataviTaskRepository, 'getResult').onCall(0).yields(null, result);
    });
    afterEach(function() {
      modelRepository.get.restore();
      pataviTaskRepository.getResult.restore();
    });
    it('should return the result for the model with that ID', function(done) {
      request
        .get(BASE_PATH + '1/models/' + model.id + '/result')
        .end(function(err, res) {
          assert(!err);
          res.should.have.property('status', httpStatus.OK);
          assert.deepEqual(result, res.body);
          done();
        });
    });
  });
  describe('GET request to /:modelID/result for model with no taskUrl', function() {
    var model = {
      id: 2
    };
    beforeEach(function() {
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
    });
    afterEach(function() {
      modelRepository.get.restore();
    });
    it('should return a 404', function(done) {
      request
        .get(BASE_PATH + '1/models/' + model.id + '/result')
        .end(function(err, res) {
          assert(err);
          res.should.have.property('status', httpStatus.NOT_FOUND);
          done();
        });
    });
  });
  describe('POST request to /:modelId where the user is not the analysis owner', function() {
    beforeEach(function() {
      var analysis = {
        owner: 399,
      };
      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
    });
    afterEach(function() {
      analysisRepository.get.restore();
    });
    it('should return FORBIDDEN', function(done) {
      var newModel = {};
      request
        .post(BASE_PATH + '1/models/1')
        .send(newModel)
        .end(function(err, res) {
          assert(err);
          res.should.have.property('status', httpStatus.FORBIDDEN);
          done();
        });
    });
  });
  describe('POST request to /:modelId with owner that is the logged in user', function() {
    var model = {
      analysisId: 1,
      id: 2
    };
    beforeEach(function() {
      var analysis = {
        id: 1,
        owner: userId,
      };
      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
      sinon.stub(modelService, 'update').onCall(0).yields(null);
      sinon.stub(pataviTaskRepository, 'deleteTask').onCall(0).yields(null);
    });
    afterEach(function() {
      analysisRepository.get.restore();
      modelRepository.get.restore();
      pataviTaskRepository.deleteTask.restore();
      modelService.update.restore();
    });

    it('should delete the patavi task, update the model and have status status.OK', function(done) {
      var runLengths = {};
      request
        .post(BASE_PATH + '1/models/2')
        .send(runLengths)
        .end(function(err, res) {
          console.error(JSON.stringify(err));
          assert(!err);
          res.should.have.property('status', httpStatus.OK);
          done();
        });
    });
  });
  describe('POST request to /:modelId with inconsistent model.analysisID and analysisID', function() {
    var model = {
      analysisId: 2,
      id: 2
    };
    beforeEach(function() {
      var analysis = {
        id: 1,
        owner: userId,
      };
      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
    });
    afterEach(function() {
      analysisRepository.get.restore();
      modelRepository.get.restore();
    });

    it('should return a 404 status', function(done) {
      var runLengths = {};
      request
        .post(BASE_PATH + '1/models/2')
        .send(runLengths)
        .end(function(err, res) {
          assert(err);
          res.should.have.property('status', httpStatus.NOT_FOUND);
          done();
        });
    });
  });
  describe('POST request to /:modelId where the modelservice returns an error', function() {
    var model = {
      analysisId: 1,
      id: 2
    };
    var analysis = {
      id: 1,
      owner: userId,
    };
    beforeEach(function() {
      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
      sinon.stub(modelService, 'update').onCall(0).yields({
        statusCode: 500,
        message: 'error'
      });
      sinon.stub(pataviTaskRepository, 'deleteTask').onCall(0).yields(null);
    });
    afterEach(function() {
      analysisRepository.get.restore();
      modelRepository.get.restore();
      pataviTaskRepository.deleteTask.restore();
      modelService.update.restore();
    });

    it('should result in a 500 error', function(done) {
      var runLengths = {};
      request
        .post(BASE_PATH + '1/models/2')
        .send(runLengths)
        .end(function(err, res) {
          assert(err);
          res.should.have.property('status', httpStatus.INTERNAL_SERVER_ERROR);
          done();
        });
    });
  });
  describe('POST request to /:modelId/attributes with owner that is the logged in user', function() {
    var model = {
      analysisId: 1,
      id: 2
    };
    var analysis = {
      id: 1,
      owner: userId,
    };

    var setArchiveStub;

    beforeEach(function() {
      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
      setArchiveStub = sinon.stub(modelRepository, 'setArchive');
      setArchiveStub.onCall(0).yields(null);
    });

    afterEach(function() {
      analysisRepository.get.restore();
      modelRepository.get.restore();
      modelRepository.setArchive.restore();
    });

    it('should call setArchived with the isArchived from the body', function(done) {
      request
        .post(BASE_PATH + '1/models/2/attributes')
        .send({
          archived: true
        })
        .end(function(err, res) {
          res.should.have.property('status', httpStatus.OK);
          assert(setArchiveStub.callCount === 1);
          done();
        });
    });
  });
  describe('POST request to /:modelId/funnelPlots with owner that is the logged in user', function() {
    var funnelCreate;
    var model = {
      analysisId: 1,
      id: 2
    };
    beforeEach(function() {
      var analysis = {
        owner: userId,
      };

      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
      funnelCreate = sinon.stub(funnelPlotRepository, 'create');
      funnelCreate.onCall(0).yields(null);
    });
    afterEach(function() {
      analysisRepository.get.restore();
      funnelPlotRepository.create.restore();
      modelRepository.get.restore();
    });

    it('should create the funnel plot and have status CREATED', function(done) {
      var funnelPlots = {
        includedComparisons: [{
          t1: 1,
          t2: 3
        }]
      };
      request
        .post(BASE_PATH + '1/models/2/funnelPlots')
        .send(funnelPlots)
        .end(function(err, res) {
          assert(!err);
          sinon.assert.calledWith(funnelCreate, model.id, funnelPlots);
          res.should.have.property('status', httpStatus.CREATED);
          done();
        });
    });
  });
  describe('GET request to /:modelId/funnelPlots', function() {
    var modelId = 1;
    var funnelPlots = [{
      id: 1,
      modelId: modelId,
      t1: 1,
      t2: 3
    }];
    beforeEach(function() {
      sinon.stub(funnelPlotRepository, 'findByModelId').onCall(0).yields(null, funnelPlots);
    });
    afterEach(function() {
      funnelPlotRepository.findByModelId.restore();
    });
    it('should return the funnel plots for that model', function(done) {
      request
        .get(BASE_PATH + '1/models/' + modelId + '/funnelPlots')
        .end(function(err, res) {
          assert(!err);
          res.should.have.property('status', httpStatus.OK);
          assert.deepEqual(funnelPlots, res.body);
          done();
        });
    });
  });
  describe('GET request to /:modelId/funnelPlots/:plotId', function() {
    var modelId = 1;
    var plotId = 2;
    var funnelPlots = [{
      id: plotId,
      modelId: modelId,
      t1: 1,
      t2: 3
    }];
    beforeEach(function() {
      sinon.stub(funnelPlotRepository, 'findByPlotId').onCall(0).yields(null, funnelPlots);
    });
    afterEach(function() {
      funnelPlotRepository.findByPlotId.restore();
    });
    it('should return the funnel plots for that plot', function(done) {
      request
        .get(BASE_PATH + '1/models/' + modelId + '/funnelPlots/' + plotId)
        .end(function(err, res) {
          assert(!err);
          res.should.have.property('status', httpStatus.OK);
          assert.deepEqual(funnelPlots, res.body);
          done();
        });
    });
  });
  describe('GET request from /:modelId/baseline', function() {
    var modelId = 1;
    var baseline = {
      "scale": "mean",
      "mu": 4,
      "sigma": 56,
      "name": "D",
      "type": "dnorm"
    };

    beforeEach(function() {
      sinon.stub(modelBaselineRepository, 'get').onCall(0).yields(null, baseline);
    });
    afterEach(function() {
      modelBaselineRepository.get.restore();
    });
    it('should return the baseline for the model', function(done) {
      request
        .get(BASE_PATH + '1/models/' + modelId + '/baseline')
        .end(function(err, res) {
          assert(!err);
          res.should.have.property('status', httpStatus.OK);
          assert.deepEqual(baseline, res.body);
          done();
        });
    });
  });
  describe('PUT request to /:modelId/baseline', function() {
    var modelId = 1;
    var baseline = {
      "scale": "mean",
      "mu": 4,
      "sigma": 56,
      "name": "D",
      "type": "dnorm"
    };
    var analysis = {
      owner: userId,
    };
    var model = {
      analysisId: 1,
      id: modelId
    };

    beforeEach(function() {
      sinon.stub(analysisRepository, 'get').onCall(0).yields(null, analysis);
      sinon.stub(modelRepository, 'get').onCall(0).yields(null, model);
      sinon.stub(modelBaselineRepository, 'set').onCall(0).yields(null);
    });

    afterEach(function() {
      analysisRepository.get.restore();
      modelRepository.get.restore();
      modelBaselineRepository.set.restore();
    });

    it('should set the baseline of the model to the new value', function(done) {
      request
        .put(BASE_PATH + '1/models/' + modelId + '/baseline')
        .send(baseline)
        .end(function(err,res){
          assert(!err);
          res.should.have.property('status', httpStatus.OK);
          done();          
        });
    });
  });

});
