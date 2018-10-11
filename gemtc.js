'use strict';
var appEnvironmentSettings = {
  googleKey: process.env.GEMTC_GOOGLE_KEY,
  googleSecret: process.env.GEMTC_GOOGLE_SECRET,
  host: process.env.GEMTC_HOST
};
var express = require('express'),
  session = require('express-session'),
  helmet = require('helmet'),
  bodyparser = require('body-parser'),
  _ = require('lodash'),
  csurf = require('csurf'),
  dbUtil = require('./standalone-app/dbUtil'),
  db = require('./standalone-app/db')(dbUtil.connectionConfig),
  loginUtils = require('./standalone-app/loginUtils'),
  signin = require('signin')(db, appEnvironmentSettings),
  analysisRouter = require('./standalone-app/analysisRouter'),
  modelRouter = require('./standalone-app/modelRouter'),
  mcdaPataviTaskRouter = require('./standalone-app/mcdaPataviTaskRouter'),
  errorHandler = require('./standalone-app/errorHandler'),
  logger = require('./standalone-app/logger');

var authenticationMethod = process.env.GEMTC_AUTHENTICATION_METHOD;
console.log('Authentication method: ' + authenticationMethod);

var sessionOptions = {
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

var app = express();
logger.info('Start Gemtc stand-alone app');

app.use(helmet());
app.use(session(sessionOptions));
app.use(bodyparser.json({ limit: '5mb' }));

switch (authenticationMethod) {
  case 'LOCAL':
    signin.useLocalLogin(app);
    break;
  default:
    authenticationMethod = 'GOOGLE';
    signin.useGoogleLogin(app);
}

app.get('/logout', function(req, res) {
  req.session.destroy(function(err){
    res.redirect('/');
  });
});

app.use(csurf());
app.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.sendFile(__dirname + '/dist/index.html');
  } else {
    res.sendFile(__dirname + '/dist/signin.html');
  }
});
app.use(loginUtils.setXSRFTokenMiddleware);
app.all('*', loginUtils.securityMiddleware);
app.use('/patavi', mcdaPataviTaskRouter);
app.use('/user', function(req, res) {
  res.json(_.omit(req.user, ['username', 'id', 'password']));
});
app.use('/analyses', analysisRouter);
app.use('/analyses/:analysisId/models', modelRouter);
app.get('/lexicon.json', function(req, res) {
  res.sendFile(__dirname + '/app/lexicon.json');
});
app.use(express.static('public'));
app.use(express.static('dist'));
app.use('/css/fonts', express.static('./dist/fonts'));
app.use(function(error, req, res, next) {
  if (error && error.type === signin.SIGNIN_ERROR) {
    res.send(401, 'login failed');
  }
});
app.use(errorHandler);
app.listen(3001);
