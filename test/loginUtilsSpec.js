var loginUtils = require('../standalone-app/loginUtils.js');
var assert = require('assert');
var status = require('http-status');
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
    describe('if the user is logged in', function() {
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

      it('should place on the response an object with the md5 hashed email of the google-logged-in user and call next', function() {

        loginUtils.emailHashMiddleware(req, res, next);
        expect(next).to.have.been.called();
        expect(res.json).to.have.been.called.with({
          md5Hash: '6a6c19fea4a3676970167ce51f39e6ee'
        });
      });
    });

    describe('if the user is not logged in', function() {
      var req = {
          session: {}
        },
        next = chai.spy(),
        res = {};

      it('should return a 403 FORBIDDEN.', function() {
        loginUtils.emailHashMiddleware(req, res, next);
        expect(res.status).to.equal(status.FORBIDDEN);
        expect(next).to.have.been.called();
      });
    });
  });

  describe('csrfValue', function() {
    describe('should extract the token from the request\'s body', function() {
      it('for the body._csrf', function() {
        req = {
          body: {
            _csrf: 'token'
          }
        };
        var token = loginUtils.csrfValue(req);
        expect(token).to.equal(req.body._csrf);
      });
      it('for the query._csrf', function() {
        req = {
          query: {
            _csrf: 'token'
          }
        };
        var token = loginUtils.csrfValue(req);
        expect(token).to.equal(req.query._csrf);
      });
      it('for the headers x-csrf-token', function() {
        req = {
          headers: {
            'x-csrf-token': 'token'
          }
        };
        var token = loginUtils.csrfValue(req);
        expect(token).to.equal(req.headers['x-csrf-token']);
      });
      it('for the headers x-xsrf-token', function() {
        req = {
          headers: {
            'x-xsrf-token': 'token'
          }
        };
        var token = loginUtils.csrfValue(req);
        expect(token).to.equal(req.headers['x-xsrf-token']);
      });
    });
  });

  describe('setXSRFTokenMiddleware', function() {
    it('should set a cookie with the session csrfSecret', function() {
      req = {
        session: {
          csrfSecret: 'secret'
        }
      };
      res = chai.spy.object(['cookie']);
      next = chai.spy();

      loginUtils.setXSRFTokenMiddleware(req, res, next);
      expect(res.cookie).to.have.been.called.with('XSRF-TOKEN', req.session.csrfSecret);
      expect(next).to.have.been.called();
    });
  });

});
