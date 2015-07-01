var loginUtils = require('../standalone-app/loginUtils.js');
var assert = require('assert');
var status = require('http-status-codes');
var chai = require('chai'),
  spies = require('chai-spies');

describe('loginUtils', function() {

  chai.use(spies);

  var should = chai.should(),
    expect = chai.expect;

  describe('securityMiddleware', function() {

    var request, resonse, session, next;

    beforeEach(function() {
      request = {
        session: {}
      };
      resonse = {};
      next = chai.spy();
    });

    it('should call next when logged in', function() {

      request.session = {
        auth: {
          loggedIn: true
        }
      };
      request.url = '/secure-me';

      loginUtils.securityMiddleware(request, resonse, next);
      expect(next).to.have.been.called();
    });

    it('should redirect to signin if no user signed in on a serure url', function() {
      resonse = chai.spy.object(['redirect']);
      request.session = {};
      request.url = '/secure-me';
      next;

      loginUtils.securityMiddleware(request, resonse, next);
      expect(resonse.redirect).to.have.been.called();
    });

    it('should call next when requesting the signin page', function() {
      request.session = {};
      request.url = '/signin.html';
      request.method = 'GET';

      loginUtils.securityMiddleware(request, resonse, next);
      expect(next).to.have.been.called();
    });    

    it('should call next when requesting the google auth', function() {
      request.session = {};
      request.url = '/auth/google/some stuff ';
      request.method = 'GET';

      loginUtils.securityMiddleware(request, resonse, next);
      expect(next).to.have.been.called();
    });  

    it('should call next when requesting a file from the /css path', function() {
      request.session = {};
      request.url = '/css/some/path/to/some/file.css';
      request.method = 'GET';

      loginUtils.securityMiddleware(request, resonse, next);
      expect(next).to.have.been.called();
    });  

    it('should call next when requesting a file from the /js path', function() {
      request.session = {};
      request.url = '/js/some/path/to/some/file.js';
      request.method = 'GET';

      loginUtils.securityMiddleware(request, resonse, next);
      expect(next).to.have.been.called();
    });  

    it('should call next when requesting a file from the /img path', function() {
      request.session = {};
      request.url = '/img/favi.ico';
      request.method = 'GET';

      loginUtils.securityMiddleware(request, resonse, next);
      expect(next).to.have.been.called();
    }); 
  });

  describe('emailHashMiddleware', function() {

    describe('if the user is logged in', function() {

      var next = chai.spy();
      var request = {
        session: {
          auth: {
            google: {
              user: {
                name: 'John Doe',
                email: 'john@doe.com'
              }
            }
          }
        }
      };
      var resonse = chai.spy.object(['json']);

      it('should place on the resonse an object with the md5 hashed email' +
        'of the google-logged-in user and call next',
        function() {
          loginUtils.emailHashMiddleware(request, resonse, next);
          expect(next).to.have.been.called();
          expect(resonse.json).to.have.been.called.with({
            name: request.session.auth.google.user.name,
            md5Hash: '6a6c19fea4a3676970167ce51f39e6ee'
          });
        });
    });

    describe('if the user is not logged in', function() {

      var resonse = chai.spy.object(['json']);
      var request = {
        session: {}
      };
      var next = chai.spy();


      it('should return a 403 FORBIDDEN.', function() {
        loginUtils.emailHashMiddleware(request, resonse, next);
        expect(resonse.status).to.equal(status.FORBIDDEN);
        expect(next).to.have.been.called();
      });
    });
  });

  describe('csrfValue', function() {
    describe('should extract the token from the request\'s body', function() {
      it('for the body._csrf', function() {
        request = {
          body: {
            _csrf: 'token'
          }
        };
        var token = loginUtils.csrfValue(request);
        expect(token).to.equal(request.body._csrf);
      });
      it('for the query._csrf', function() {
        request = {
          query: {
            _csrf: 'token'
          }
        };
        var token = loginUtils.csrfValue(request);
        expect(token).to.equal(request.query._csrf);
      });
      it('for the headers x-csrf-token', function() {
        request = {
          headers: {
            'x-csrf-token': 'token'
          }
        };
        var token = loginUtils.csrfValue(request);
        expect(token).to.equal(request.headers['x-csrf-token']);
      });
      it('for the headers x-xsrf-token', function() {
        request = {
          headers: {
            'x-xsrf-token': 'token'
          }
        };
        var token = loginUtils.csrfValue(request);
        expect(token).to.equal(request.headers['x-xsrf-token']);
      });
    });
  });

  describe('setXSRFTokenMiddleware', function() {
    it('should set a cookie with the session csrfSecret', function() {
      var token = 'token';
      request = {
        csrfToken: function() {
          return token;
        }
      };
      resonse = chai.spy.object(['cookie']);
      next = chai.spy();

      loginUtils.setXSRFTokenMiddleware(request, resonse, next);
      expect(resonse.cookie).to.have.been.called.with('XSRF-TOKEN', token);
      expect(next).to.have.been.called();
    });
  });

});