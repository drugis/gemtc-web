'use strict';
var crypto = require('crypto'),
  httpStatus = require('http-status-codes'),
  logger = require('./logger');

// check if startsWith is not a language feature
if (typeof String.prototype.startsWith !== 'function') {
  String.prototype.startsWith = function(str) {
    return this.indexOf(str) === 0;
  };
}

module.exports = {
  csrfValue: function(req) {
    logger.debug('loginUtils.csrfValue');
    var token = (req.body && req.body._csrf) ||
      (req.query && req.query._csrf) ||
      (req.headers['x-csrf-token']) ||
      (req.headers['x-xsrf-token']);
    return token;
  },

  setXSRFTokenMiddleware: function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  },

  securityMiddleware: function(request, response, next) {
    logger.debug('loginUtils.securityMiddleware; request.headers.host = ' + (request.headers ? request.headers.host : 'unknown host'));

    if (request.isAuthenticated()) { // if loggedin your good
      logger.debug('loginUtils.loginCheckMiddleware; you\'re signed in, request = ' + request.url);
      next();
    }
    else if (request.method === 'GET' && request.url === '/') {
      logger.debug('loginUtils.loginCheckMiddleware request to "/", redirect to sign in page ');
      response.redirect('/signin.html');
    }
    else if (request.method === 'GET' && // if not then you can get static content or go sign in
      (
        request.url === '/signin.html' ||
        request.url === '/signin.bundle.js' ||
        request.url === '/vendor.bundle.js' ||
        request.url === '/main.bundle.js' ||
        request.url === '/manual.html' ||
        request.url === '/manual/shared-toc.html' ||
        request.url === '/manual/shared.html' ||
        request.url.startsWith('/auth/google')
      )) {
      logger.debug('loginUtils.loginCheckMiddleware you request does not require login, request =  ' + request.url);
      next();
    }
    else { // otherwhise you have to signin first
      logger.debug('loginUtils.loginCheckMiddleware you need to signin first, request =  ' + request.url);
      response.sendStatus(403);
    }
  }
};
