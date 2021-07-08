'use strict';
var loginUtils = require('../standalone-app/loginUtils.js');
var chai = require('chai'),
  spies = require('chai-spies');

describe('loginUtils', function () {
  chai.use(spies);
  var expect = chai.expect;

  describe('securityMiddleware', function () {
    var request, response, next;

    beforeEach(function () {
      request = {
        session: {}
      };
      next = chai.spy();
      response = {};
      response.redirect = chai.spy();
    });

    it('should call next when logged in', function () {
      request.isAuthenticated = function () {
        return true;
      };
      request.url = '/secure-me';

      loginUtils.securityMiddleware(request, response, next);
      expect(next).to.have.been.called();
    });

    it('should redirect to signin if no user signed in on a secure url', function () {
      response = {sendStatus: chai.spy()};
      request.isAuthenticated = function () {
        return false;
      };
      request.url = '/secure-me';

      loginUtils.securityMiddleware(request, response, next);
      expect(response.sendStatus).to.have.been.called.with(403);
    });

    it('should call next when requesting the signin page', function () {
      request.isAuthenticated = function () {
        return false;
      };
      request.url = '/signin.html';
      request.method = 'GET';

      loginUtils.securityMiddleware(request, response, next);
      expect(next).to.have.been.called();
    });

    it('should call next when requesting the google auth', function () {
      request.isAuthenticated = function () {
        return false;
      };
      request.url = '/auth/google/some stuff ';
      request.method = 'GET';

      loginUtils.securityMiddleware(request, response, next);
      expect(next).to.have.been.called();
    });
  });

  describe('setXSRFTokenMiddleware', function () {
    it('should set a cookie with the session csrfSecret', function () {
      var token = 'token';
      var request = {
        csrfToken: function () {
          return token;
        }
      };
      var response = {
        cookie: chai.spy()
      };
      var next = chai.spy();

      loginUtils.setXSRFTokenMiddleware(request, response, next);
      expect(response.cookie).to.have.been.called.with('XSRF-TOKEN', token);
      expect(next).to.have.been.called();
    });
  });
});
