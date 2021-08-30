'use strict';
var proxyquire = require('proxyquire'),
  chai = require('chai'),
  spies = require('chai-spies'),
  sinon = require('sinon'),
  chaiExpect = chai.expect;

chai.use(spies);

var httpsStub = {};

var pataviTaskRepository;

describe('the patavi task repository', function () {
  beforeEach(function () {
    pataviTaskRepository = proxyquire(
      '../standalone-app/pataviTaskRepository',
      {
        https: httpsStub
      }
    );
  });
  describe('getResult', function () {
    it('should get the result', function (done) {
      var pataviResult = {
        status: 'done',
        _links: {
          results: {
            href: 'http://resultsLink.com'
          }
        }
      };
      var resultsResult = {};

      var callback = function (error) {
        chaiExpect(error).to.equal(null);
        httpsStub.get.restore();
        done();
      };
      var getStub = sinon.stub(httpsStub, 'get');
      stubHttpResponse(getStub, 0, pataviResult);
      stubHttpResponse(getStub, 1, resultsResult);
      pataviTaskRepository.getResult('http://123.com', callback);
    });

    it('should return an error when no results are present', function (done) {
      var responseFromTaskQuery = buildHttpResponse({});
      var callback = function (error) {
        chaiExpect(error).to.eql({
          description: 'no result found'
        });
        httpsStub.get.restore();
        done();
      };
      var getStub = sinon.stub(httpsStub, 'get');
      getStub.onCall(0).yields(responseFromTaskQuery);
      getStub.onCall(0).returns({
        on: function () {}
      });
      pataviTaskRepository.getResult('http://123.com', callback);
    });
  });
  describe('getPataviTasksStatus', function () {
    it('should get the task status for the given uris', function (done) {
      var url1 = 'http://url1.com',
        url2 = 'http://url2.com';
      var urls = [url1, url2];
      var expectedResult = [
        {
          id: url1,
          runStatus: 'done'
        },
        {
          id: url2,
          runStatus: undefined
        }
      ];

      var expectationsCallback = function (err, result) {
        chaiExpect(err).to.equal(null);
        chaiExpect(result).to.deep.equal(expectedResult);
        httpsStub.get.restore();
        done();
      };

      var doneTaskResponse = {
        status: 'done'
      };
      var notDoneTaskResponse = {};
      var getStub = sinon.stub(httpsStub, 'get');
      stubHttpResponse(getStub, 0, doneTaskResponse);
      stubHttpResponse(getStub, 1, notDoneTaskResponse);

      pataviTaskRepository.getPataviTasksStatus(urls, expectationsCallback);
    });
  });
  describe('create', function () {
    it('should post the problem to patavi, and return the task url from the response location', function (done) {
      var problem = {};
      var checkResponseAndCleanup = function (error, createdurl) {
        chaiExpect(error).to.equal(null);
        chaiExpect(createdurl).to.equal('createdUrl');
        httpsStub.request.restore();
        done();
      };
      var response = {
        statusCode: 201,
        headers: {
          location: 'createdUrl'
        }
      };
      sinon
        .stub(httpsStub, 'request')
        .onCall(0)
        .yields(response)
        .onCall(0)
        .returns({write: function () {}, end: function () {}});
      pataviTaskRepository.create(
        problem,
        'service=gemtc',
        checkResponseAndCleanup
      );
    });
  });

  describe('deleteTask', function () {
    it('should delete the task', function (done) {
      var taskId = 'http://taskId.com';
      var checkResponseAndCleanup = function (error) {
        chaiExpect(error).to.equal(null);
        httpsStub.request.restore();
        done();
      };
      var response = {
        statusCode: 200
      };
      sinon
        .stub(httpsStub, 'request')
        .onCall(0)
        .yields(response)
        .onCall(0)
        .returns({end: function () {}});
      pataviTaskRepository.deleteTask(taskId, checkResponseAndCleanup);
    });
  });
});

//// util

function stubHttpResponse(methodStub, callNumber, resultObject) {
  var response = buildHttpResponse(resultObject);
  methodStub.onCall(callNumber).yields(response);
  methodStub.onCall(callNumber).returns({
    on: function () {}
  });
}

function buildHttpResponse(resultObject) {
  return {
    setEncoding: function () {},
    on: function (eventName, callback) {
      if (eventName === 'data') {
        callback(JSON.stringify(resultObject));
      } else if (eventName === 'end') {
        callback();
      }
    }
  };
}
