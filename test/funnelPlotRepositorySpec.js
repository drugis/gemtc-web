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

var funnelPlotRepository = proxyquire('../standalone-app/funnelPlotRepository', {
  './db': dbStub
});

describe('the funnelplot repository', function() {
  describe('create', function() {

    var query;
    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
      query.onCall(0).yields(null);
    });

    afterEach(function() {
      queryStub.query.restore();
    });

    it('should call db with the values to create', function(done) {
      var includedComparisons = [{
          t1: 3,
          t2: 4,
          biasDirection: 1
        }, {
          t1: 5,
          t2: 7,
          biasDirection: 2
        }],
        newFunnelPlot = {
          includedComparisons: includedComparisons
        },
        modelId = 1;

      var expectedQuery = "INSERT INTO funnelplot (modelId, t1, t2, biasDirection) VALUES " +
        "($1, $2, $3, $4),($5, $6, $7, $8)";
      var expectedValues = [
        modelId, includedComparisons[0].t1, includedComparisons[0].t2, includedComparisons[0].biasDirection,
        modelId, includedComparisons[1].t1, includedComparisons[1].t2, includedComparisons[1].biasDirection,
      ];

      funnelPlotRepository.create(modelId, newFunnelPlot, function() {
        sinon.assert.calledWith(query, expectedQuery, expectedValues);
        done();
      });
    });
  });

  describe('findByModelId', function() {
    var
      result = [{
        id: 2,
        modelid: 1,
        t1: 1,
        t2: 3,
        biasdirection: 1
      }],
      query;
    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
      query.onCall(0).yields(null, result);
    });

    afterEach(function() {
      queryStub.query.restore();
    });
    it('should query the funnelplots for the modelId', function(done) {
      var modelId = 1;
      var expectedResult = [{
        id: 2,
        modelId: 1,
        t1: 1,
        t2: 3,
        biasDirection: 1
      }];
      funnelPlotRepository.findByModelId(modelId, function(error, result) {
        assert(!error);
        sinon.assert.calledWith(query, 'SELECT id, modelId, t1, t2, biasDirection FROM funnel_plot WHERE modelId = $1', [modelId]);
        assert.deepEqual(expectedResult, result);
        done();
      });
    });
  });

  describe('get', function() {
    var
      modelId = 1,
      result = [{
        id: 2,
        modelid: modelId,
        t1: 1,
        t2: 3,
        biasdirection: 2
      }],
      query;
    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
      query.onCall(0).yields(null, result);
    });

    afterEach(function() {
      queryStub.query.restore();
    });
    it('should get the funnelplots with the plot id', function(done) {
      var expectedResult = [{
        id: 2,
        modelId: modelId,
        t1: 1,
        t2: 3,
        biasDirection: 2
      }];
      funnelPlotRepository.findByPlotId(modelId, function(error, result) {
        assert(!error);
        sinon.assert.calledWith(query, 'SELECT id, modelId, t1, t2, biasDirection FROM funnel_plot WHERE id = $1', [modelId]);
        assert.deepEqual(expectedResult, result);
        done();
      });
    });
  });
});
