var assert = require('assert'),
  proxyquire = require('proxyquire'),
  should = require('should'),
  assert = require('assert'),
  status = require('http-status-codes'),
  sinon = require('sinon'),
  request = require('superagent');

var express = require('express');
var app = express();

var modelRepository = {};
var pataviTaskRepository = {};
var modelRouter = proxyquire('../standalone-app/modelRouter', {
  './modelRepository': modelRepository,
  './pataviTaskRepository': pataviTaskRepository
});


describe('modelRouter', function() {
  var server;
  before(function() {
    server = app.use('/analyses/:analysisId/models', modelRouter).listen(3999);
  });

  after(function() {
    server.close();
  });

  describe('GET request to /', function() {
    var taskId = 101;
    var taskId2 = 102;

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

    sinon.stub(modelRepository, "findByAnalysis").onCall(0).yields(null, models);
    sinon.stub(pataviTaskRepository, "getPataviTasksStatus").onCall(0).yields(null, pataviTasks);

    it('should find all models', function(done) {

      var expextedResult = [{
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

      request('GET', 'http://localhost:3999/analyses/1/models/')
        .end(function(err, res) {
          res.should.have.property('status', 200);
          res.should.have.property('body', expextedResult);
          done();
        });

    });
  });

  describe('POST request to /', function() {
    it('should create a model', function(done) {
      var newModel = {};
      request('POST', 'http://localhost/3999/analyses/1/models/', newModel)
        .end(function(err, res) {
          assert(undefined, err);
          res.should.have.property('status', 201)
          done();
        });

    });
  });

  describe('POST request to /something', function(done) {
    request('POST', 'http://localhost/3999/analyses/1/models/2/something', {})
      .end(function(err, res) {
        assert(undefined, err);
        res.should.have.property('status', 201)
        done();
      });
  });

  describe('POST request to /1/extendRunLength', function() {

    it('should check the ownership', function(done) {
      var runLengthSettings = {
        burnInIterations: 3000,
        inferenceIterations: 20000,
        thinningFactor: 10
      };
      request('POST', 'http://localhost/3999/analyses/1/models/1/extendRunLength', runLengthSettings)
        .end(function(err, res) {
          assert(undefined, err);
          res.should.have.property('status', 200)
          done();
        });
    });
  });
});
