'use strict';
var logger = require('./logger');
const {StatusCodes} = require('http-status-codes');

module.exports = {
  setXSRFTokenMiddleware: function (cookieSettings, request, response, next) {
    response.cookie('XSRF-TOKEN', request.csrfToken(), cookieSettings);
    next();
  },

  securityMiddleware: function (request, response, next) {
    logger.debug(
      'loginUtils.securityMiddleware; request.headers.host = ' +
        (request.headers ? request.headers.host : 'unknown host')
    );

    if (request.isAuthenticated()) {
      // if loggedin your good
      logger.debug(
        "loginUtils.loginCheckMiddleware; you're signed in, request = " +
          request.url
      );
      next();
    } else if (
      request.method === 'GET' && // if not then you can get static content or go sign in
      (request.url.startsWith('/img') ||
        request.url.startsWith('/css') ||
        request.url.startsWith('/fonts') ||
        request.url.endsWith('.html') ||
        request.url.endsWith('.js') ||
        request.url.startsWith('/auth/google'))
    ) {
      logger.debug(
        'loginUtils.loginCheckMiddleware you request does not require login, request =  ' +
          request.url
      );
      next();
    } else {
      // otherwhise you have to signin first
      logger.debug(
        'loginUtils.loginCheckMiddleware you need to signin first, request =  ' +
          request.url
      );
      response.sendStatus(StatusCodes.FORBIDDEN);
    }
  }
};
