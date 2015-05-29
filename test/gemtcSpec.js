var server = require('../gemtc.js');
var superagent = require('superagent');
var status = require('http-status');
var assert = require('assert');

describe('/', function() {
  var app;

  before(function() {
    app = server;
  });

  after(function() {
    app.close();
  });

  it('should redirect to signin if no user signed in', function(done) {
    superagent.get('http://localhost:3000/').end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, status.OK);
      assert.equal(res.url, '/signin.html');
    });
  });
});
