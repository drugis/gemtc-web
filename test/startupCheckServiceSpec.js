'use strict';
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const chai = require('chai');
const spies = require('chai-spies');
const fs = require('fs');
const https = require('https');

chai.use(spies);
const expect = chai.expect;

const dbStub = {
  query: () => { }
};

const startupCheckService = proxyquire(
  '../standalone-app/startupCheckService', {})(dbStub);

describe('the startup check service', () => {
  describe('checkDBConnection', () => {
    var query;

    beforeEach(() => {
      query = sinon.stub(dbStub, 'query');
    });

    afterEach(() => {
      query.restore();
    });

    it('should call the callback with an empty array if there are no errors', () => {
      var callback = chai.spy();
      query.onCall(0).yields(null);
      startupCheckService.checkDBConnection(callback);
      expect(callback).to.have.been.called.with(null, []);
    });

    it('should call the callback with an array containting error messages', () => {
      var dbError = 'db error';
      var expectedErrorMessage = 'Connection to database unsuccessful. <i>' + dbError + '</i>.<br> Please make sure the database is running and the environment variables are set correctly.';
      var callback = chai.spy();
      query.onCall(0).yields('db error');
      startupCheckService.checkDBConnection(callback);
      expect(callback).to.have.been.called.with(null, [expectedErrorMessage]);
    });
  });

  describe('checkPataviConnection', () => {
    var existsSync;
    var readFileSync;
    var httpsRequest;

    beforeEach(() => {
      existsSync = sinon.stub(fs, 'existsSync');
      readFileSync = sinon.stub(fs, 'readFileSync');
      httpsRequest = sinon.stub(https, 'request');
    });

    afterEach(() => {
      existsSync.restore();
      readFileSync.restore();
      httpsRequest.restore();
    });

    it('should call the callback with an empty array if there are no errors', () => {
      var callback = chai.spy();
      var result = {
        statusCode: 200
      };
      var postRequest = {
        on: () => {},
        end: () => {}
      };
      existsSync.returns(true);
      readFileSync.returns(true);
      httpsRequest.onCall(0).yields(result).onCall(0).returns(postRequest);

      startupCheckService.checkPataviConnection(callback);
      expect(callback).to.have.been.called.with(null, []);
    });

    it('should call the callback with certificate errors', () => {
      var callback = chai.spy();
      existsSync.returns(false);
      
      startupCheckService.checkPataviConnection(callback);

      var expectedError1 = 'Patavi client key not found. Please make sure it is accessible at the specified location.';
      var expectedError2 = 'Patavi client certificate not found. Please make sure it is accessible at the specified location.';
      var expectedError3 = 'Patavi certificate authority not found. Please make sure it is accessible at the specified location.';
      expect(callback).to.have.been.called.with(null, [expectedError1, expectedError2, expectedError3]);
    });

    it('should call the callback with a patavi connection error', () => {
      var callback = chai.spy();
      var error = 'post request error';
      var postRequest = {
        on: (event, postRequestCallback) => {
          postRequestCallback(error);
        },
        end: () => {}
      };
      existsSync.returns(true);
      readFileSync.returns(true);
      httpsRequest.onCall(0).returns(postRequest);
      
      startupCheckService.checkPataviConnection(callback);

      var expectedError = 'Connection to Patavi unsuccessful: <i>' + error + '</i>.<br> Please make sure the Patavi server is running and the environment variables are set correctly.';
      expect(callback).to.have.been.called.with(null, [expectedError]);
    });

    it('should call the callback with an unexpected status code error', () => {
      var callback = chai.spy();
      var result = {
        statusCode: 201
      };
      var postRequest = {
        on: () => {},
        end: () => {}
      };
      existsSync.returns(true);
      readFileSync.returns(true);
      httpsRequest.onCall(0).yields(result).onCall(0).returns(postRequest);

      startupCheckService.checkPataviConnection(callback);

      var expectedError = 'Connection to Patavi successful but received incorrect status code: <i>' + result.statusCode + '</i>.';
      expect(callback).to.have.been.called.with(null, [expectedError]);
    });
  });

});
