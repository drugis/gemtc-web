var dbUtil = require('../standalone-app/dbUtil.js');
var chai = require('chai');
var expect = chai.expect;

describe('dbUtil', function() {
  describe('buildGemtcDBUrl', function() {
    it('should build the GeMTC DB URL based on the environment variables', function() {
      process.env.DB_HOST = 'host';
      process.env.GEMTC_DB = 'database';
      process.env.GEMTC_DB_USERNAME = 'username';      
      process.env.GEMTC_DB_PASSWORD = 'password';      
      expect(dbUtil.buildGemtcDBUrl()).to.equal('postgres://username:password@host/database');
    });
  });
  describe('buildPataviDBUrl', function() {
    it('should build the Patavi DB URL based on the environment variables', function() {
      process.env.DB_HOST = 'host';
      process.env.PATAVI_TASK_DB = 'database';
      process.env.PATAVI_TASK_DB_USERNAME = 'username';      
      process.env.PATAVI_TASK_DB_PASSWORD = 'password';      
      expect(dbUtil.buildGemtcDBUrl()).to.equal('postgres://username:password@host/database');
    });
  });
});