var proxyquire = require('proxyquire');
var chai = require('chai'),
  spies = require('chai-spies'),
  sinon = require('sinon'),
  expect = chai.expect,
  _ = require('lodash');

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

  })

  it(' should get the result', function(done) {

    var template = 'SELECT result FROM patavitask WHERE id = $1';
    var resultFromQuery = {
      rows: [{
        result: '{"results": "result"}'
      }]
    };
    var callback = function(error, data) {
      expect(error).to.be.null;
      done();
    };
    sinon.stub(dbStub, 'query').onCall(0).yields(null, resultFromQuery);
    pataviTaskRepository.getResult(123, callback);
  });

  it('should get the result when none are precent', function(done) {

    var template = 'SELECT result FROM patavitask WHERE id = $1';
    var resultFromQuery = {
      rows: []
    };
    var callback = function(error, data) {
      expect(error).to.eql({
        description: 'no result found'
      });
      done();
    };
    sinon.stub(dbStub, 'query').onCall(0).yields(null, resultFromQuery);
    pataviTaskRepository.getResult(123, callback);
  });
});