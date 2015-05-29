var loginUtils = require('../standalone-app/loginUtils.js');
var assert = require('assert');
var chai = require('chai'),
  spies = require('chai-spies');

describe('loginUtils', function() {

  chai.use(spies);

  var should = chai.should(),
    expect = chai.expect;

  describe('loginCheckMiddleware', function() {

    it('should call next', function() {
      var req = {
          session: {
            auth: {
              loggedIn: true
            }
          }
        },
        res,
        next = chai.spy();

      loginUtils.loginCheckMiddleware(req, res, next);

      expect(next).to.have.been.called();
    });

    it('should redirect to signin if no user signed in', function() {
      var res = chai.spy.object(['redirect']),
        req = {
          session: {}
        },
        next;

      loginUtils.loginCheckMiddleware(req, res, next);

      expect(res.redirect).to.have.been.called();
    });
  });

  describe('emailHashMiddleware', function() {
    it('should place on the response an object with the md5 hashed email of the google-logged-in user and call next', function() {
      var req = {
          session: {
            auth: {
              google: {
                user: {
                  email: 'john@doe.com'
                }
              }
            }
          }
        },
        next = chai.spy(),
        res = chai.spy.object(['json']);

      loginUtils.emailHashMiddleware(req, res, next);
      expect(next).to.have.been.called();
      expect(res.json).to.have.been.called.with({
        md5Hash: '6a6c19fea4a3676970167ce51f39e6ee'
      });
    });
  });

});
