var winston = require('winston'),
  express = require('express'),
  session = require('express-session'),
  csrf = require('csurf'),
  everyauth = require('everyauth'),
  loginUtils = require('./standalone-app/loginUtils'),
  userRepository = require('./standalone-app/userRepository'),
  analysesRouter = require('./standalone-app/analysesRouter');

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: process.argv[2] }),
    ]
  });

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
    logger.debug('gemtc.handleAuthCallbackError');
  //todo redirect to error page
  })
  .findOrCreateUser(function(session, accessToken, accessTokenExtra, googleUserMetadata) {
    logger.debug("gemtc.findOrCreateUser");
    var promise = this.Promise();
    userRepository.findUserByGoogleId(googleUserMetadata.id, function(error, result) {
      var user = result;
      if (!user) {
        userRepository.createUserAndConnection(accessToken, accessTokenExtra, googleUserMetadata, function(error, result) {
          user = {
            'username': googleUserMetadata.name,
            'firstName': googleUserMetadata.given_name,
            'lastName': googleUserMetadata.family_name
          };
          promise.fulfill(user);
        });
      } else {
        promise.fulfill(user);
      }
    });
    return promise;
  }).redirectPath('/');

var app = express();

logger.info('Start Gemct stand-alone app');
logger.debug("gemtc.findOrCreateUser");

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
