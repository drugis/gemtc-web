'use strict';
var proxyquire = require('proxyquire'),
  assert = require('assert'),
  sinon = require('sinon');

var queryStub = {
    query: function() {
      console.log('query being called');
    }
  },
  dbStub = function() {
    return queryStub;
  };

var modelBaselineRepository = proxyquire('../standalone-app/modelBaselineRepository', {
  './db': dbStub
});

describe('the model baseline repository', function() {
  describe('getBaseline', function() {
    var query,
      result = {
        rows: [{
          id: 1,
          baseline: {
            distr: 'dnorm'
          }
        }]
      };
    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
      query.onCall(0).yields(null, result);
    });

    afterEach(function() {
      query.restore();
    });

    it('should get the baseline', function(done) {
      var modelId = 1234;
      var expectedQuery = 'SELECT modelId, baseline FROM modelBaseline WHERE modelId=$1',
        expectedValues = [modelId];

      modelBaselineRepository.get(modelId, function(err, res) {
        sinon.assert.calledWith(query, expectedQuery, expectedValues);
        assert.deepEqual(res, result.rows[0]);
        done();
      });
    });
  });

  describe('setBaseline', function () {
    var query;
    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
      query.onCall(0).yields(null);
    });

    afterEach(function() {
      query.restore();
    });

    it('should set the baseline', function(done) {
      var modelId = 1234;
      var baseline = {
        foo: 'bar'
      };
      var expectedQuery = 'insert into modelBaseline values($1, $2) ON CONFLICT(modelId) DO UPDATE SET baseline=$2',
        expectedValues = [modelId, baseline];

      modelBaselineRepository.set(modelId, baseline, function(err, res) {
        sinon.assert.calledWith(query, expectedQuery, expectedValues);
        done();
      });
    });
  });
});
