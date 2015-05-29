var crypto = require('crypto');
var status = require('http-status');

module.exports = {
  csrfValue: function(req) {
    var token = (req.body && req.body._csrf)
      || (req.query && req.query._csrf)
      || (req.headers['x-csrf-token'])
      || (req.headers['x-xsrf-token']);
    return token;
  },

  setXSRFTokenMiddleware: function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.session.csrfSecret);
    next();
  },

  loginCheckMiddleware: function(req, res, next) {
    if (req.session.auth && req.session.auth.loggedIn) {
      next();
    } else {
      res.redirect('/signin.html');
    }
  },

  emailHashMiddleware: function(req, res, next) {
    if (!req.session.auth) {
      res.status = status.FORBIDDEN;
    } else {
      var md5Hash = crypto.createHash('md5').update(req.session.auth.google.user.email).digest('hex');
      res.json({
        md5Hash: md5Hash
      });
    }
    next();
  }
};
