'use strict';
var assert = require('assert');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = chai.expect;

var modelRepository = {};
var modelService = proxyquire('../standalone-app//modelService', {
  './modelRepository': modelRepository
});


describe('the model service', function() {
  describe('update', function() {
    describe('for too-low runlength settings', function() {
      it('should call the callback with a non-null error parameter', function(done) {
        var oldModel = {
          burnInIterations: 20,
          inferenceIterations: 30
        };
        var newModel = {
          burnInIterations: 10,
          inferenceIterations: 20
        };
        var errorMessage = 'Error: may not update model with lower number of iterations';
        var callback = function(error) {
          expect(error).to.equal(errorMessage);
          done();
        };
        modelService.update(oldModel, newModel, callback);
      });
    });

    describe('for correct runlength settings', function() {
      beforeEach(function() {
        sinon.stub(modelRepository, 'update').onCall(0).yields(null);
      });

      afterEach(function() {
        modelRepository.update.restore();
      });

      it('should update the model in the repository', function(done) {
        var oldModel = {
          burnInIterations: 10,
          inferenceIterations: 20
        };
        var newModel = {
          burnInIterations: 20,
          inferenceIterations: 30
        };
        var callback = function(error) {
          assert(!error);
          assert(modelRepository.update.calledWith(newModel));
          done();
        };
        modelService.update(oldModel, newModel, callback);
      });
    });

    describe('partitionModels', function() {
      it('should return two arrays containing models with and without an assigned task', function() {
        var models = [{
          id: 1,
          taskUrl: 'url'
        }, {
          id: 2
        }];
        var result = modelService.partitionModels(models);
        var expectedResult = {
          modelsWithTask: [models[0]],
          modelsWithoutTask: [models[1]],
        };
        expect(result).to.deep.equal(expectedResult);
      });
    });

    describe('decorateWithRunStatus', function() {
      it('should append a runStatus parameter to the models', function() {
        var taskUrl = 'http://host.com/taskUrl';
        var runStatus = 'runStatus';
        var models = [{
          taskUrl: taskUrl
        }];
        var pataviResult = [{
          id: taskUrl,
          runStatus: runStatus
        }];
        var result = modelService.decorateWithRunStatus(models, pataviResult);
        var expectedResult = [{
          taskUrl: taskUrl,
          runStatus: runStatus
        }];
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});
