var crypto = require('crypto');

module.exports = {
  loginCheckMiddleware: function(req, res, next) {
    if (req.session.auth && req.session.auth.loggedIn) {
      next();
    } else {
      res.redirect('/signin.html');
    }
  },
  emailHashMiddleware: function(req, res, next) {
    var md5Hash = crypto.createHash('md5').update(req.session.auth.google.user.email).digest('hex');
    res.json({
      md5Hash: md5Hash
    });
    next();
  }
};
