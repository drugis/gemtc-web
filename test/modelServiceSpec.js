var assert = require('assert'),
  sinon = require('sinon'),
  proxyquire = require('proxyquire');

var modelRepository = {};
var modelService = proxyquire('../standalone-app//modelService', {
  './modelRepository': modelRepository
});


describe('the model service', function() {
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
      modelService.update(oldModel, newModel, function(error) {
        assert(error);
        done();
      });
    })
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
      modelService.update(oldModel, newModel, function(error) {
        assert(!error);
        assert(modelRepository.update.calledWith(newModel));
        done();
      });
    })
  });
});
