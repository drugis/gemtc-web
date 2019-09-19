'use strict';
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const chai = require('chai');
const spies = require('chai-spies');

chai.use(spies);
const expect = chai.expect;

const dbStub = {};
const startupCheckServiceStub = {
  checkDBConnection: chai.spy(),
  checkPataviConnection: chai.spy()
};

const startupDiagnosticsService = proxyquire(
  '../standalone-app/startupDiagnosticsService', {
  './startupCheckService': () => { return startupCheckServiceStub; }
})(dbStub);

describe('the startup diagnostics', () => {
  describe('runStartupDiagnostics', () => {
    var checkDB;
    var checkPatavi;
    const errorHeader = '<h3>GeMTC could not be started. The following errors occured:</h3>';
    const divStart = '<div style="padding: 10px">';
    const divEnd = '</div>';
    const pataviError = 'patavi connection error';
    const dbError = 'db connection error';

    beforeEach(() => {
      checkDB = sinon.stub(startupCheckServiceStub, 'checkDBConnection');
      checkPatavi = sinon.stub(startupCheckServiceStub, 'checkPataviConnection');
    });

    afterEach(() => {
      checkDB.restore();
      checkPatavi.restore();
    });

    it('should call the callback without errors', (done) => {
      checkDB.onCall(0).yields(null, []);
      checkPatavi.onCall(0).yields(null, []);
      var callback = function(errors) {
        expect(errors).to.equal(undefined);
        done();
      };

      startupDiagnosticsService.runStartupDiagnostics(callback);
    });

    it('should call the callback with a patavi connection error', (done) => {
      checkDB.onCall(0).yields(null, []);
      checkPatavi.onCall(0).yields(null, [pataviError]);
      var expectedError = errorHeader + divStart + pataviError + divEnd;
      var callback = function(errors) {
        expect(errors).to.equal(expectedError);
        done();
      };

      startupDiagnosticsService.runStartupDiagnostics(callback);
    });

    it('should call the callback with a DB connection error', (done) => {
      checkDB.onCall(0).yields(null, [dbError]);
      checkPatavi.onCall(0).yields(null, []);
      var expectedError = errorHeader + divStart + dbError + divEnd;
      var callback = function(errors) {
        expect(errors).to.equal(expectedError);
        done();
      };

      startupDiagnosticsService.runStartupDiagnostics(callback);
    });

    it('should call the callback with both a DB and a patavi connection error', (done) => {
      checkDB.onCall(0).yields(null, [dbError]);
      checkPatavi.onCall(0).yields(null, [pataviError]);
      var expectedError = errorHeader +
        divStart + dbError + divEnd +
        divStart + pataviError + divEnd;
      var callback = function(errors) {
        expect(errors).to.equal(expectedError);
        done();
      };

      startupDiagnosticsService.runStartupDiagnostics(callback);
    });

    it('should call the callback with an error if the parallel execution goes wrong', (done) => {
      var error = 'parallel error';
      checkDB.onCall(0).yields(null, []);
      checkPatavi.onCall(0).yields(error, []);
      var expectedError = errorHeader +
        divStart + 'Could not execute diagnostics, unknown error: ' + error + divEnd;
      var callback = function(errors) {
        expect(errors).to.equal(expectedError);
        done();
      };

      startupDiagnosticsService.runStartupDiagnostics(callback);
    });
  });

});
