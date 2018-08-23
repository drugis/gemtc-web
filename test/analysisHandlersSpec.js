'use strict';
var proxyquire = require('proxyquire');

var chai = require('chai'),
  spies = require('chai-spies'),
  chaiExpect = chai.expect;

chai.use(spies);
var analysisRepositoryStub = chai.spy.object(['query', 'create', 'get']);

var analysisHandlers = proxyquire('../standalone-app/analysisHandlers', {
  './analysisRepository': analysisRepositoryStub
});

describe('analyses handlers', function() {
  describe('queryAnalyses', function() {
    it('should query the analyses repository', function(done) {
      var request = {
        session: {
          userId: 'userId'
        }
      },
      response = {};
      analysisHandlers.queryAnalyses(request, response);
      chaiExpect(analysisRepositoryStub.query).to.have.been.called();
      done();
    });
  });
});
