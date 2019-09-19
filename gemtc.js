'use strict';
var appEnvironmentSettings = {
  googleKey: process.env.GEMTC_GOOGLE_KEY,
  googleSecret: process.env.GEMTC_GOOGLE_SECRET,
  host: process.env.GEMTC_HOST
};
var express = require('express');
var session = require('express-session');
var helmet = require('helmet');
var bodyparser = require('body-parser');
var _ = require('lodash');
var csurf = require('csurf');
var httpStatus = require('http-status-codes');
var dbUtil = require('./standalone-app/dbUtil');
var db = require('./standalone-app/db')(dbUtil.connectionConfig);
var loginUtils = require('./standalone-app/loginUtils');
var signin = require('signin')(db, appEnvironmentSettings);
var analysisRepository = require('./standalone-app/analysisRepository');
var rightsManagement = require('rights-management')(analysisRepository.get);
var analysisRouter = require('./standalone-app/analysisRouter');
var modelRouter = require('./standalone-app/modelRouter');
var mcdaPataviTaskRouter = require('./standalone-app/mcdaPataviTaskRouter');
var errorHandler = require('./standalone-app/errorHandler');
var logger = require('./standalone-app/logger');
var StartupDiagnosticsService = require('./standalone-app/startupDiagnosticsService')(db);

var app = express();
logger.info('Start Gemtc stand-alone app');

app.use(helmet());
app.use(bodyparser.json({ limit: '5mb' }));

StartupDiagnosticsService.runStartupDiagnostics((errorBody) => {
  if (errorBody) {
    initError(errorBody);
  } else {
    initApp();
  }
});

function initApp() {
  var authenticationMethod = process.env.GEMTC_AUTHENTICATION_METHOD;
  setRequiredRights();
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
  app.use(session(sessionOptions));
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
}

function initError(errorBody) {
  app.get('*', function(req, res) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR)
      .set('Content-Type', 'text/html')
      .send(errorBody);
  });
  app.listen(3001, function() {
    console.error('Access the diagnostics summary at http://localhost:3001');
  });
}

function setRequiredRights() {
  rightsManagement.setRequiredRights([
    makeRights('/patavi', 'POST', 'none'),
    makeRights('/analyses', 'GET', 'none'),
    makeRights('/analyses', 'POST', 'none'),
    makeRights('/analyses/:analysisId', 'GET', 'read'),
    makeRights('/analyses/:analysisId', 'DELETE', 'owner'),
    makeRights('/analyses/:analysisId/problem', 'GET', 'read'),
    makeRights('/analyses/:analysisId/setPrimaryModel', 'POST', 'write'),
    makeRights('/analyses/:analysisId/setTitle', 'PUT', 'write'),
    makeRights('/analyses/:analysisId/setOutcome', 'PUT', 'write'),
    makeRights('/analyses/:analysisId/setProblem', 'PUT', 'write'),
    makeRights('/analyses/:analysisId/models', 'GET', 'read'),
    makeRights('/analyses/:analysisId/models', 'POST', 'write'),
    makeRights('/analyses/:analysisId/models/:modelId', 'GET', 'read'),
    makeRights('/analyses/:analysisId/models/:modelId', 'POST', 'write'),
    makeRights('/analyses/:analysisId/models/:modelId', 'DELETE', 'owner'),
    makeRights('/analyses/:analysisId/models/:modelId/task', 'GET', 'read'),
    makeRights('/analyses/:analysisId/models/:modelId/result', 'GET', 'read'),
    makeRights('/analyses/:analysisId/models/:modelId/baseline', 'GET', 'read'),
    makeRights('/analyses/:analysisId/models/:modelId/setTitle', 'PUT', 'write'),
    makeRights('/analyses/:analysisId/models/:modelId/setSensitivity', 'PUT', 'write'),
    makeRights('/analyses/:analysisId/models/:modelId/baseline', 'PUT', 'write'),
    makeRights('/analyses/:analysisId/models/:modelId/attributes', 'POST', 'write'),
    makeRights('/analyses/:analysisId/models/:modelId/funnelPlots', 'GET', 'read'),
    makeRights('/analyses/:analysisId/models/:modelId/funnelPlots', 'POST', 'write'),
    makeRights('/analyses/:analysisId/models/:modelId/funnelPlots/:plotId', 'GET', 'read')
  ]);
}

function makeRights(path, method, requiredRight) {
  return {
    path: path,
    method: method,
    requiredRight: requiredRight
  };
}