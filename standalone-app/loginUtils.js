var crypto = require('crypto'),
  httpStatus = require('http-status-codes'),
  logger = require('./logger');

// check if strartsWith is not a language feature
if (typeof String.prototype.startsWith != 'function') {
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

  emailHashMiddleware: function(request, response, next) {
    logger.debug('loginUtils.emailHashMiddleware; request.headers.host = ' + (request.headers ? request.headers.host : 'unknown host'));
    if (!request.session.auth) {
      response.status = httpStatus.FORBIDDEN;
    } else {
      var md5Hash = crypto.createHash('md5').update(request.session.auth.google.user.email).digest('hex');
      response.json({
        name: request.session.auth.google.user.name,
        md5Hash: md5Hash
      });
    }
    next();
  },

  securityMiddleware: function(request, response, next) {
    logger.debug('loginUtils.securityMiddleware; request.headers.host = ' + (request.headers ? request.headers.host : 'unknown host'));

    if (request.session.auth && request.session.auth.loggedIn) { // if loggedin your good
      logger.debug('loginUtils.loginCheckMiddleware your signed in, requestuest = ' + request.url);
      next();
    } else if (request.method === 'GET' && // if not than you can get static content or go sign in
      (request.url.startsWith('/css') ||
        request.url.startsWith('/js') ||
        request.url.startsWith('/views') ||
        request.url.startsWith('/img') ||
        request.url == '/signin.html' ||
        request.url.startsWith('/auth/google')
      )) {
      logger.debug('loginUtils.loginCheckMiddleware you request does not require login, request =  ' + request.url);
      next();
    } else { // otherwhise you have to signin first
      logger.debug('loginUtils.loginCheckMiddleware you need to signin first, request =  ' + request.url);
      response.redirect('/signin.html');
    }
  }
};