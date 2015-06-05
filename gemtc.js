var
  express = require('express'),
  session = require('express-session'),
  bodyparser = require('body-parser'),
  csrf = require('csurf'),
  everyauth = require('everyauth'),
  loginUtils = require('./standalone-app/loginUtils'),
  userRepository = require('./standalone-app/userRepository'),
  analysesRouter = require('./standalone-app/analysesRouter'),
  logger = require('./standalone-app/logger');


var sessionOpts = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
};

//everyauth.debug = true;

everyauth.everymodule.findUserById( function (userId, callback) {
  logger.debug("gemtc.findUserById");
  callback(null);
});

everyauth.google
  .appId('100331616436-dgi00c0mjg8tbc06psuhluf9a2lo6c3i.apps.googleusercontent.com')
  .appSecret('9ROcvzLDuRbITbqj-m-W5C0I')
  .scope('https://www.googleapis.com/auth/userinfo.profile email')
  .handleAuthCallbackError(function(req, res) {
    logger.debug('gemtc.handleAuthCallbackError');
  //todo redirect to error page
  })
  .redirectPath('/')
  .findOrCreateUser(function(session, accessToken, accessTokenExtra, googleUserMetadata, data) {

    logger.debug("gemtc.findOrCreateUser");
    var promise = this.Promise();
    userRepository.findUserByGoogleId(googleUserMetadata.id, function(error, result) {
      var user = result;
      if (!user) {
        userRepository.createUserAndConnection(accessToken, accessTokenExtra, googleUserMetadata, function(error, result) {
          user = {
            id: result,
            username: googleUserMetadata.name,
            firstName: googleUserMetadata.given_name,
            lastName: googleUserMetadata.family_name
          };
          promise.fulfill(user);
        });
      } else {
        session.userId = user.id;
        promise.fulfill(user);
      }
    });
    return promise;
  });

var app = express();

logger.info('Start Gemtc stand-alone app');

module.exports = app
  .use(session(sessionOpts))

  .use(csrf({
    value: loginUtils.csrfValue
  }))
  .use(bodyparser.json())
  .use(loginUtils.setXSRFTokenMiddleware)
  .all('*', loginUtils.securityMiddleware)
  .get('/user', loginUtils.emailHashMiddleware)
  .use('/analyses', analysesRouter)
  .use(express.static('app'))
  .use(everyauth.middleware())
  .listen(3000);
