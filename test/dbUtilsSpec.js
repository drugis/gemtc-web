var dbUtil = require('../standalone-app/dbUtil.js');
var chai = require('chai');
var expect = chai.expect;

describe('dbUtil', function() {
  describe('building db path based on env settings', function() {

    it('should build the GeMTC DB URL based on the environment variables', function() {
      expect(dbUtil.gemtcDBUrl).to.equal('postgres://' +
        process.env.GEMTC_DB_USERNAME +
        ':' +
        process.env.GEMTC_DB_PASSWORD +
        '@' +
        process.env.DB_HOST +
        '/' +
        process.env.GEMTC_DB);
    });
    it('should build the connection config based on the environment variables', function() {
      expect(dbUtil.connectionConfig).to.deep.equal({
        user: process.env.GEMTC_DB_USERNAME,
        database: process.env.GEMTC_DB,
        password: process.env.GEMTC_DB_PASSWORD
      });
    });

  });
});
