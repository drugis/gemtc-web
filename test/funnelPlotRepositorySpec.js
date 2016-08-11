'use strict';
var proxyquire = require('proxyquire'),
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
      var newFunnelPlot = {
        includedComparisons: [{
          t1: 3,
          t2: 4
        }]
      }
      funnelPlotRepository.create(1, newFunnelPlot, function() {
        sinon.assert.calledWith(query, 1);
      });
    });
  });
});
