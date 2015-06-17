var proxyquire = require('proxyquire');
var request = require('supertest');

var chai = require('chai'),
  spies = require('chai-spies'),
  expect = chai.expect;

chai.use(spies);
var analysisRepositoryStub = chai.spy.object(['query', 'create', 'get']);

var url = 'http://localhost:3001';

var analysisHandlers = proxyquire('../standalone-app/analysisHandlers', {
  './analysisRepository': analysisRepositoryStub
});

describe('analyses routes', function() {
  describe('queryAnalyses', function() {
    it('should query the analyses repository', function(done) {
      var request = {
        session: {
          userId: 'userId'
        }
      },
      response = {};
      analysisHandlers.queryAnalyses(request, response);
      expect(analysisRepositoryStub.query).to.have.been.called();
      done();
    });
  });
});
