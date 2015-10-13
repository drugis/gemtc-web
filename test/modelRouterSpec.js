var assert = require('assert'),
  proxyquire = require('proxyquire'),
  should = require('should'),
  status = require('http-status-codes'),
  sinon = require('sinon'),
  session = require('express-session'),
  request = require('superagent'),
  express = require('express'),
  errorHandler = require('../standalone-app/errorHandler');

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
  analysisRepository = {};

var modelRouter = proxyquire('../standalone-app/modelRouter', {
  './modelRepository': modelRepository,
  './modelService': modelService,
  './pataviTaskRepository': pataviTaskRepository,
  './analysisRepository': analysisRepository
});

describe('modelRouter', function() {
  var server;

  before(function() {
    server = app
      .use(session(sessionOpts))
      .use(function(req, res, next) {
        req.session.userId = userId;
        next();
      })
      .use('/analyses/:analysisId/models', modelRouter)
      .use(errorHandler)
      .listen(3999);
  });
  after(function() {
    server.close();
  });

  describe('request to /', function() {
    var taskId = 101;
    var taskId2 = 102;
    beforeEach(function() {

      var models = [{
        id: 1,
        title: 'model1'
      }, {
        id: 2,
        title: 'model2',
        taskId: taskId
      }, {
        id: 3,
        title: 'model3',
        taskId: taskId2
      }];

      var pataviTasks = [{
        id: taskId,
        hasresult: true
      }, {
        id: taskId2,
        hasresult: false
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
        taskId: taskId,
        hasResult: true
      }, {
        id: 3,
        title: 'model3',
        taskId: taskId2,
        hasResult: false
      }];

      request('GET', BASE_PATH + '1/models/')
        .end(function(err, res) {
          res.should.have.property('status', status.OK);
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
          res.should.have.property('status', status.FORBIDDEN);
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

    it('should create the model and have status status.CREATED', function(done) {
      var newModel = {};
      var expectedBody = {
        id: createdId
      };
      request
        .post(BASE_PATH + '1/models/')
        .send(newModel)
        .end(function(err, res) {
          assert(!err);
          res.should.have.property('status', status.CREATED);
          assert.equal('/analyses/1/models/' + createdId, res.headers['location'])
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
          res.should.have.property('status', status.OK);
          assert.deepEqual(model, res.body);
          done();
        });
    });
  });
  describe('GET request to /:modelID/result', function() {
    var model = {
      id: 2,
      taskId: 3
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
          res.should.have.property('status', status.OK);
          assert.deepEqual(result, res.body);
          done();
        });
    });
  });
  describe('GET request to /:modelID/result for model with no taskId', function() {
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
          res.should.have.property('status', status.NOT_FOUND);
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
          res.should.have.property('status', status.FORBIDDEN);
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
          console.log(JSON.stringify(err))
          assert(!err);
          res.should.have.property('status', status.OK);
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
          res.should.have.property('status', status.NOT_FOUND);
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
          res.should.have.property('status', status.INTERNAL_SERVER_ERROR);
          done();
        });
    });
  });
});
