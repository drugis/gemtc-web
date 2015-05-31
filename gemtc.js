var express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  cookieParser = require('cookie-parser'),
  csrf = require('csurf'),
  everyauth = require('everyauth'),

  loginUtils = require('./standalone-app/loginUtils'),
  analysesRouter = require('./standalone-app/analysesRouter');

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
    loginUtils.findUserByGoogleId(googleUserMetadata.id, function(user){
      if(!user) {
      // todo create account in db
      }
      // after user has been stored, add the id to the session
    });

    return {
      'username': googleUserMetadata.name,
      'firstName': googleUserMetadata.given_name,
      'lastName': googleUserMetadata.family_name
    };
  }).redirectPath('/');

var app = express();

module.exports = app
  .use(session(sessionOpts))
  .use(csrf({
    value: loginUtils.csrfValue
  }))
  .use(loginUtils.setXSRFTokenMiddleware)
  .use(everyauth.middleware())
  .get('/', loginUtils.loginCheckMiddleware)
  .get('/user', loginUtils.emailHashMiddleware)
  .use('/analyses', analysesRouter)
  .use(express.static('app'))
  .listen(3000);
