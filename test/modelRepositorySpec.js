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

var modelRepository = proxyquire('../standalone-app/modelRepository', {
  './db': dbStub
});

describe('the model repository', function() {
  describe('setArchive', function() {
    var query;
    beforeEach(function() {
      query = sinon.stub(queryStub, 'query');
      query.onCall(0).yields(null);
    });

    afterEach(function() {
      query.restore();
    });

    it('should setArchive', function(done) {
      var modelId = 1234;
      var isArchived = true;
      var archivedOn = new Date();
      var expectedQuery = 'UPDATE model SET archived=$2, archived_on=$3  WHERE id = $1',
        expectedValues = [modelId, isArchived, archivedOn];

      modelRepository.setArchive(modelId, isArchived, archivedOn, function() {
        sinon.assert.calledWith(query, expectedQuery, expectedValues);
        done();
      });
    });
  });
});
