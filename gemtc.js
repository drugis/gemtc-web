var express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  everyauth = require('everyauth');

everyauth.google
  .appId('100331616436-dgi00c0mjg8tbc06psuhluf9a2lo6c3i.apps.googleusercontent.com')
  .appSecret('9ROcvzLDuRbITbqj-m-W5C0I')
  .scope('https://www.googleapis.com/auth/userinfo.profile email')
  .handleAuthCallbackError(function(req, res) {
    // If a user denies your app, Google will redirect the user to
    // /auth/facebook/callback?error=access_denied
    // This configurable route handler defines how you want to respond to
    // that.
    // If you do not configure this, everyauth renders a default fallback
    // view notifying the user that their authentication failed and why.
    console.log('gemtc.handleAuthCallbackError');
  })
  .findOrCreateUser(function(session, accessToken, accessTokenExtra, googleUserMetadata) {
    // find or create user logic goes here
    // Return a user or Promise that promises a user
    // Promises are created via
    //     var promise = this.Promise();
    console.log('find or create useer');
    return {
      "username": googleUserMetadata.name,
      "firstName": googleUserMetadata.given_name,
      "lastName": googleUserMetadata.family_name
    };
  }).redirectPath('/');

var app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(cookieParser('mr ripley'));
app
  .use(express.static('app'))
  .use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
  .use(everyauth.middleware());

app.get("/", function(req, res, next) {
  if (req.session.auth && req.session.auth.loggedIn) {
    console.log('user found');
    res.redirect('/projects.html');
  } else {
    console.log('user not found');
    res.redirect('/signin.html');

  }
});

app.listen(3000);

module.exports = app;