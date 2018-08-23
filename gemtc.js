'use strict';
var express = require('express'),
  session = require('express-session'),
  helmet = require('helmet'),
  bodyparser = require('body-parser'),
  csurf = require('csurf'),
  dbUtil = require('./standalone-app/dbUtil'),
  db = require('./standalone-app/db')(dbUtil.connectionConfig),
  loginUtils = require('./standalone-app/loginUtils'),
  userManagement = require('./standalone-app/userManagement')(db),
  analysisRouter = require('./standalone-app/analysisRouter'),
  modelRouter = require('./standalone-app/modelRouter'),
  mcdaPataviTaskRouter = require('./standalone-app/mcdaPataviTaskRouter'),
  errorHandler = require('./standalone-app/errorHandler'),
  logger = require('./standalone-app/logger');


var sessionOpts = {
  store: new (require('connect-pg-simple')(session))({
    conString: dbUtil.gemtcDBUrl,
  }),
  secret: process.env.GEMTC_COOKIE_SECRET,
  resave: true,
  proxy: process.env.GEMTC_USE_PROXY,
  rolling: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hour
    secure: false
  }
};

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(
  new GoogleStrategy({
    clientID: process.env.GEMTC_GOOGLE_KEY,
    clientSecret: process.env.GEMTC_GOOGLE_SECRET,
    callbackURL: process.env.GEMTC_HOST + "/auth/google/callback"
  },
    userManagement.findOrCreateUser
  ));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var app = express();

logger.info('Start Gemtc stand-alone app');

module.exports = app
  .use(helmet())
  .use(session(sessionOpts))
  .get('/signin', function(req, res) {
    res.sendFile(__dirname + '/dist/signin.html');
  })
  .use(passport.initialize())
  .use(passport.session())
  .get('/auth/google/', passport.authenticate('google', { scope: ['profile', 'email'] }))
  .get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signin' }),
    function(req, res) {
      res.redirect('/');
    })
  .get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  })
  // .use(csurf({  // ?????
  //   value: loginUtils.csrfValue
  // }))
  .use(csurf())
  .use(bodyparser.json({ limit: '5mb' }))
  .use(loginUtils.setXSRFTokenMiddleware)
  .all('*', loginUtils.securityMiddleware)
  .use('/patavi', mcdaPataviTaskRouter)
  .use('/analyses', analysisRouter)
  .use('/analyses/:analysisId/models', modelRouter)
  .get('/lexicon.json', function(req, res) {
    res.sendFile(__dirname + '/app/lexicon.json');
  })
  .use(express.static('dist'))
  .use(express.static('fonts'))
  .use(express.static('../manual'))
  .use(errorHandler)
  .listen(3001);
