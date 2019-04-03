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
  analysisRepository = require('./standalone-app/analysisRepository'),
  rightsManagement = require('rights-management')(analysisRepository.get),
  analysisRouter = require('./standalone-app/analysisRouter'),
  modelRouter = require('./standalone-app/modelRouter'),
  mcdaPataviTaskRouter = require('./standalone-app/mcdaPataviTaskRouter'),
  errorHandler = require('./standalone-app/errorHandler'),
  logger = require('./standalone-app/logger');

var authenticationMethod = process.env.GEMTC_AUTHENTICATION_METHOD;

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

function makeRights(path, method, requiredRight) {
  return {
    path: path,
    method: method,
    requiredRight: requiredRight
  };
}

rightsManagement.setRequiredRights([
  makeRights('/patavi', 'POST', 'none'),
  makeRights('/analyses', 'GET', 'none'),
  makeRights('/analyses', 'POST', 'none'),
  makeRights('/analyses/:analysisId', 'GET', 'read'),
  makeRights('/analyses/:analysisId/problem', 'GET', 'read'),
  makeRights('/analyses/:analysisId/setPrimaryModel', 'POST', 'write'),
  makeRights('/analyses/:analysisId/models', 'GET', 'read'),
  makeRights('/analyses/:analysisId/models', 'POST', 'write'),
  makeRights('/analyses/:analysisId/models/:modelId', 'GET', 'read'),
  makeRights('/analyses/:analysisId/models/:modelId', 'POST', 'write'),
  makeRights('/analyses/:analysisId/models/:modelId/task', 'GET', 'read'),
  makeRights('/analyses/:analysisId/models/:modelId/result', 'GET', 'read'),
  makeRights('/analyses/:analysisId/models/:modelId/baseline', 'GET', 'read'),
  makeRights('/analyses/:analysisId/models/:modelId/baseline', 'PUT', 'write'),
  makeRights('/analyses/:analysisId/models/:modelId/attributes', 'POST', 'write'),
  makeRights('/analyses/:analysisId/models/:modelId/funnelPlots', 'GET', 'read'),
  makeRights('/analyses/:analysisId/models/:modelId/funnelPlots', 'POST', 'write'),
  makeRights('/analyses/:analysisId/models/:modelId/funnelPlots/:plotId', 'GET', 'read')
]);

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
console.log('Authentication method: ' + authenticationMethod);

app.get('/logout', function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
});

app.use(csurf());
app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    res.sendFile(__dirname + '/dist/index.html');
  } else {
    res.sendFile(__dirname + '/dist/signin.html');
  }
});
app.use(express.static('public'));
app.use(express.static('dist'));
app.get('/lexicon.json', function(req, res) {
  res.sendFile(__dirname + '/app/lexicon.json');
});
app.use('/css/fonts', express.static('./dist/fonts'));
app.use(loginUtils.setXSRFTokenMiddleware);
app.all('*', loginUtils.securityMiddleware);
app.use('/user', function(req, res) {
  res.json(_.omit(req.user, ['username', 'id', 'password']));
});
app.use(rightsManagement.expressMiddleware);
app.use('/patavi', mcdaPataviTaskRouter);
app.use('/analyses', analysisRouter);
app.use('/analyses/:analysisId/models', modelRouter);
app.use(function(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }
  if (error && error.type === signin.SIGNIN_ERROR) {
    res.status(401).send('login failed');
  } else {
    next(error);
  }
});
app.use(errorHandler);
app.listen(3001);
