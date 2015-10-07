var assert = require('assert'),
  proxyquire = require('proxyquire'),
  should = require('should'),
  assert = require('assert'),
  status = require('http-status-codes'),
  sinon = require('sinon'),
  session = require('express-session'),
  request = require('superagent'),
  express = require('express');

var app = express();
var BASE_PATH = 'http://localhost:3999/analyses/';
var sessionOpts = {
  secret: 'secret',
  resave: false,
  saveUninitialized: true
};
var userId = 1;

var modelRepository = {};
var pataviTaskRepository = {};
var analysisRepository = {};

var modelRouter = proxyquire('../standalone-app/modelRouter', {
  './modelRepository': modelRepository,
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
      modelRepository.findByAnalysis.reset();
      pataviTaskRepository.getPataviTasksStatus.reset();
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
          res.should.have.property('status', 200);
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
          res.should.have.property('status', 403);
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

    it('should create the model and have status 201', function(done) {
      var newModel = {};
      var expectedBody = {
        id: createdId
      };
      request
        .post(BASE_PATH + '1/models/')
        .send(newModel)
        .end(function(err, res) {
          assert(!err);
          res.should.have.property('status', 201);
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
      modelRepository.get.reset();
    });
    it('should return the model with that ID', function(done) {
      request
        .get(BASE_PATH + '1/models/' + model.id)
        .end(function(err, res){
          assert(!err);
          res.should.have.property('status', 200);
          assert.deepEqual(model, res.body);
          done();
        });
    });
  });
});
