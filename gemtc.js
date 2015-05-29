var express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  everyauth = require('everyauth');

var sessionOpts = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
};

everyauth.google
  .appId('100331616436-dgi00c0mjg8tbc06psuhluf9a2lo6c3i.apps.googleusercontent.com')
  .appSecret('9ROcvzLDuRbITbqj-m-W5C0I')
  .scope('https://www.googleapis.com/auth/userinfo.profile email')
  .handleAuthCallbackError(function(req, res) {
    // If a user denies your app, Google will redirect the user to
    // /auth/facebook/callback?error=access_denied
    // This configurable route handler defines how you want to respond to that.
    // If you do not configure this, everyauth renders a default fallback
    // view notifying the user that their authentication failed and why.
    console.log('gemtc.handleAuthCallbackError');
  })
  .findOrCreateUser(function(session, accessToken, accessTokenExtra, googleUserMetadata) {
    // find or create user logic goes here
    // Return a user or Promise that promises a user
    // Promises are created via
    //     var promise = this.Promise();
    return {
      "username": googleUserMetadata.name,
      "firstName": googleUserMetadata.given_name,
      "lastName": googleUserMetadata.family_name
    };
  }).redirectPath('/');

function loginCheckMiddleware(req, res, next) {
  if (req.session.auth && req.session.auth.loggedIn) {
    next();
  } else {
    res.redirect('/signin.html');
  }
}

var app = express();

module.exports = app
  .use(session(sessionOpts))
  .use(everyauth.middleware(app))
  .get("/", loginCheckMiddleware)
  .use(express.static('app'))
  .listen(3000);
