var server = require('../gemtc.js');
var superagent = require('superagent');
var status = require('http-status-codes');
var assert = require('assert');

describe('/', function() {
  var basePath;
  var app;

  before(function() {
    debugger;
    app = server;
    basePath =  process.env.GEMTC_HOST;
  });

  after(function() {
    app.close();
  });

  it('should redirect to signin if no user signed in', function(done) {

    superagent.get(basePath + '/').end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, status.OK);
      assert.equal(res.redirects[0], basePath + '/signin.html');
      done();
    });
  });
});
