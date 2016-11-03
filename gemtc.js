'use strict';
var express = require('express'),
  session = require('express-session'),
  bodyparser = require('body-parser'),
  csrf = require('csurf'),
  everyauth = require('everyauth'),
  loginUtils = require('./standalone-app/loginUtils'),
  userRepository = require('./standalone-app/userRepository'),
  analysisRouter = require('./standalone-app/analysisRouter'),
  modelRouter = require('./standalone-app/modelRouter'),
  errorHandler = require('./standalone-app/errorHandler'),
  logger = require('./standalone-app/logger');


var sessionOpts = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
};


everyauth.everymodule.findUserById(function(userId, callback) {
  logger.debug("gemtc.findUserById");
  callback(null);
});

everyauth.google
  .myHostname(process.env.GEMTC_HOST)
  .authQueryParam({
    approval_prompt: 'auto'
  })
  .appId(process.env.GEMTC_GOOGLE_KEY)
  .appSecret(process.env.GEMTC_GOOGLE_SECRET)
  .scope('https://www.googleapis.com/auth/userinfo.profile email')
  .handleAuthCallbackError(function() {
    logger.debug('gemtc.handleAuthCallbackError');
    //todo redirect to error page
  })
  .redirectPath('/')
  .findOrCreateUser(function(session, accessToken, accessTokenExtra, googleUserMetadata) {

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
          session.userId = user.id;
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
  .use('/analyses', analysisRouter)
  .use('/analyses/:analysisId/models', modelRouter)
  .use(express.static('app'))
  .use(express.static('manual'))
  .use(everyauth.middleware())
  .use(errorHandler)
  .listen(3001);
