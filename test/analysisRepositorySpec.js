'use strict';
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var queryStub = {
  query: function() {
    console.log('query being called');
  }
},
  dbStub = function() {
    return queryStub;
  };

var analysisRepository = proxyquire('../standalone-app/analysisRepository', {
  './db': dbStub
});

describe('the analysis repository', function() {
  var expectedError = 'error';
  var analysisId = 1;
  var ownerAccountId = 1;

  function succesCallback(query, expectedQuery, expectedValues, expectedResult, done) {
    return function(error, result) {
      sinon.assert.calledWith(query, expectedQuery, expectedValues);
      expect(error).to.be.null;
      expect(result).to.deep.equal(expectedResult);
      done();
    };
  }

  function succesCallbackWithoutReturnValue(query, expectedQuery, expectedValues, done) {
    return function(error) {
      sinon.assert.calledWith(query, expectedQuery, expectedValues);
      expect(error).to.be.undefined;
      done();
    };
  }

  function errorCallback(query, expectedQuery, expectedValues, done) {
    return function(error) {
      sinon.assert.calledWith(query, expectedQuery, expectedValues);
      expect(error).to.equal(expectedError);
      done();
    };
  }

  describe('get', function() {
    var query;
    var expectedQuery = 'SELECT * FROM analysis WHERE ID=$1';

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should get the analysis and call the callback with the result', function(done) {
      var queryResult = {
        rows: [{ primarymodel: {} }]
      };
      var expectedResult = {
        primaryModel: {}
      };
      query.onCall(0).yields(null, queryResult);
      var expectedValues = [analysisId];
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);
      analysisRepository.get(analysisId, callback);
    });

    it('should call callback with only an error', function(done) {
      query.onCall(0).yields(expectedError);
      var expectedValues = [analysisId];
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      analysisRepository.get(analysisId, callback);
    });

  });

  describe('query', function() {
    var query;
    var expectedQuery = 'SELECT id, owner, title, problem, outcome FROM analysis WHERE OWNER=$1';

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should get all analyses for an owner and call the callback withg the result', function(done) {
      var queryResult = {
        rows: [{ primarymodel: {} }]
      };
      query.onCall(0).yields(null, queryResult);
      var expectedValues = [ownerAccountId];
      var callback = succesCallback(query, expectedQuery, expectedValues, queryResult, done);
      analysisRepository.query(ownerAccountId, callback);
    });

    it('should call callback with only an error', function(done) {
      query.onCall(0).yields(expectedError);
      var expectedValues = [ownerAccountId];
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      analysisRepository.query(ownerAccountId, callback);
    });
  });

  describe('create', function() {
    var query;
    var expectedQuery = 'INSERT INTO analysis (title, outcome, problem, owner) VALUES($1, $2, $3, $4) RETURNING id';
    var newAnalysis = {
      title: 'title',
      outcome: 'outcome',
      problem: 'problem'
    };

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should insert new analysis and call callback with the id of the new analysis', function(done) {
      var queryResult = {
        rows: [{
          id: 1
        }]
      };
      var expectedResult = 1;
      query.onCall(0).yields(null, queryResult);
      var expectedValues = [newAnalysis.title, newAnalysis.outcome, newAnalysis.problem, ownerAccountId];
      var callback = succesCallback(query, expectedQuery, expectedValues, expectedResult, done);

      analysisRepository.create(ownerAccountId, newAnalysis, callback);
    });

    it('should call callback with only an error', function(done) {
      query.onCall(0).yields(expectedError);
      var expectedValues = [newAnalysis.title, newAnalysis.outcome, newAnalysis.problem, ownerAccountId];
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      analysisRepository.create(ownerAccountId, newAnalysis, callback);
    });
  });

  describe('setPrimaryModel', function() {
    var query;
    var primaryModelId = 1;
    var expectedQuery = 'UPDATE analysis SET primaryModel = $1 where id = $2';

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should update the primary model of the analysis', function(done) {
      query.onCall(0).yields(null);
      var expectedValues = [primaryModelId, analysisId];
      var callback = succesCallbackWithoutReturnValue(query, expectedQuery, expectedValues, done);
      analysisRepository.setPrimaryModel(analysisId, primaryModelId, callback);
    });

    it('should call callback with only an error', function(done) {
      query.onCall(0).yields(expectedError);
      var expectedValues = [primaryModelId, analysisId];
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      analysisRepository.setPrimaryModel(analysisId, primaryModelId, callback);
    });
  });

  describe('setTitle', function() {
    var query;
    var expectedQuery = 'UPDATE analysis SET title = $1 WHERE id = $2';

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });
    var newTitle = 'title';

    it('should update the title of the analysis', function(done) {
      query.onCall(0).yields(null);
      var expectedValues = [newTitle, analysisId];
      var callback = succesCallbackWithoutReturnValue(query, expectedQuery, expectedValues, done);
      analysisRepository.setTitle(analysisId, newTitle, callback);
    });

    it('should call callback with only an error', function(done) {
      query.onCall(0).yields(expectedError);
      var expectedValues = [newTitle, analysisId];
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      analysisRepository.setTitle(analysisId, newTitle, callback);
    });
  });

  describe('setOutcome', function() {
    var query;
    var expectedQuery = 'UPDATE analysis SET outcome = $1 WHERE id = $2';

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });
    var newOutcome = '{name: "newName", direction:-1}';

    it('should update the outcome of the analysis', function(done) {
      query.onCall(0).yields(null);
      var expectedValues = [newOutcome, analysisId];
      var callback = succesCallbackWithoutReturnValue(query, expectedQuery, expectedValues, done);
      analysisRepository.setOutcome(analysisId, newOutcome, callback);
    });

    it('should call callback with only an error', function(done) {
      query.onCall(0).yields(expectedError);
      var expectedValues = [newOutcome, analysisId];
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      analysisRepository.setOutcome(analysisId, newOutcome, callback);
    });
  });

  describe('deleteAnalysis', function() {
    var query;
    var expectedQuery = 'DELETE FROM analysis WHERE id = $1';

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should delete the analysis from the table', function(done) {
      query.onCall(0).yields(null);
      var expectedValues = [analysisId];
      var callback = succesCallbackWithoutReturnValue(query, expectedQuery, expectedValues, done);
      analysisRepository.deleteAnalysis(analysisId, callback);
    });

    it('should call the callback with only an error', function(done) {
      query.onCall(0).yields(expectedError);
      var expectedValues = [analysisId];
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      analysisRepository.deleteAnalysis(analysisId, callback);
    });
  });

  describe('setProblem', function() {
    var query;
    var expectedQuery = 'UPDATE analysis SET problem = $1 WHERE id = $2';
    var problem = {};

    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
    });

    afterEach(function() {
      query.restore();
    });

    it('should update the problem in the analysis table', function(done) {
      query.onCall(0).yields(null);
      var expectedValues = [problem, analysisId];
      var callback = succesCallbackWithoutReturnValue(query, expectedQuery, expectedValues, done);
      analysisRepository.setProblem(analysisId, problem, callback);
    });

    it('should call the callback with only an error', function(done) {
      query.onCall(0).yields(expectedError);
      var expectedValues = [problem, analysisId];
      var callback = errorCallback(query, expectedQuery, expectedValues, done);
      analysisRepository.setProblem(analysisId, problem, callback);
    });
  });

});
