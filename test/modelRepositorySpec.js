'use strict';
var proxyquire = require('proxyquire');
var chai = require('chai'),
  spies = require('chai-spies'),
  sinon = require('sinon'),
  chaiExpect = chai.expect;

chai.use(spies);

var httpsStub = {};

var modelRepository;

describe('the model repository', function() {
  beforeEach(function() {
    modelRepository = proxyquire('../standalone-app/modelRepository', {
      'https': httpsStub
    });
  });


  describe('setArchive', function() {
    it('should setArchive', function(done) {
      var modelId = 1234;
      var isArchived = true;

      modelRepository.setArchive(modelId, isArchived, function() {
        done();
      });
    });
  });
});
