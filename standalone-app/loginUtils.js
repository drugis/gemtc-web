'use strict';
var logger = require('./logger');

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
    } else if (request.method === 'GET' && ( // if not then you can get static content or go sign in
      request.url.startsWith('/img') ||
      request.url.startsWith('/css') ||
      request.url.startsWith('/fonts') ||
      request.url.endsWith('.html') ||
      request.url.endsWith('.js') ||
      request.url.startsWith('/auth/google')
    )) {
      logger.debug('loginUtils.loginCheckMiddleware you request does not require login, request =  ' + request.url);
      next();
    } else { // otherwhise you have to signin first
      logger.debug('loginUtils.loginCheckMiddleware you need to signin first, request =  ' + request.url);
      response.sendStatus(403);
    }
  }
};
