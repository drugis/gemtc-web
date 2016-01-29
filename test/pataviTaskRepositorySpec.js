'use strict';
var proxyquire = require('proxyquire');
var chai = require('chai'),
  spies = require('chai-spies'),
  sinon = require('sinon'),
  chaiExpect = chai.expect;

chai.use(spies);

var dbStub;
var pataviTaskRepository;

describe('the patavi task repository', function() {
  beforeEach(function() {
    dbStub = chai.spy.object(['query']);
    pataviTaskRepository = proxyquire('../standalone-app/pataviTaskRepository', {
      './db': function() {
        return dbStub;
      }
    });
  });

  it(' should get the result', function(done) {
    var resultFromQuery = {
      rows: [{
        result: '{"results": "result"}'
      }]
    };
    var callback = function(error) {
      chaiExpect(error).to.equal(null);
      done();
    };
    sinon.stub(dbStub, 'query').onCall(0).yields(null, resultFromQuery);
    pataviTaskRepository.getResult(123, callback);
  });

  it('should get the result when none are precent', function(done) {
    var resultFromQuery = {
      rows: []
    };
    var callback = function(error) {
      chaiExpect(error).to.eql({
        description: 'no result found'
      });
      done();
    };
    sinon.stub(dbStub, 'query').onCall(0).yields(null, resultFromQuery);
    pataviTaskRepository.getResult(123, callback);
  });
});
