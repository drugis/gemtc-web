var server = require('../gemtc.js');
var superagent = require('superagent');
var status = require('http-status');
var assert = require('assert');

describe('/', function() {
  var basePath;
  var app;

  before(function() {
    app = server;
    basePath =  'http://' + app.address().address + ':' + app.address().port;
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
