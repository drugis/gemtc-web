'use strict';
var appEnvironmentSettings = {
  googleKey: process.env.GEMTC_GOOGLE_KEY,
  googleSecret: process.env.GEMTC_GOOGLE_SECRET,
  host: process.env.GEMTC_HOST
};
var express = require('express');
var session = require('express-session');
var helmet = require('helmet');
var _ = require('lodash');
var csurf = require('csurf');
var dbUtil = require('./standalone-app/dbUtil');
var db = require('./standalone-app/db')(dbUtil.connectionConfig);
var loginUtils = require('./standalone-app/loginUtils');
var signin = require('signin')(db, appEnvironmentSettings);
var AnalysisRepository = require('./standalone-app/analysisRepository');
var rightsManagement = require('rights-management')();
var analysisRouter = require('./standalone-app/analysisRouter');
var modelRouter = require('./standalone-app/modelRouter');
var mcdaPataviTaskRouter = require('./standalone-app/mcdaPataviTaskRouter');
var errorHandler = require('./standalone-app/errorHandler');
var logger = require('./standalone-app/logger');
var StartupDiagnostics = require('startup-diagnostics')(db, logger, 'GeMTC');
const {StatusCodes} = require('http-status-codes');

const cookieSettings = {
  maxAge: 60 * 60 * 1000, // 1 hour
  secure: false,
  sameSite: 'lax'
};

function rightsCallback(response, next, userId, error, workspace) {
  if (error) {
    next(error);
  } else if (workspace.owner !== userId) {
    response.status(StatusCodes.FORBIDDEN).send('Insufficient user rights');
  } else {
    next();
  }
}

var app = express();
logger.info('Start Gemtc stand-alone app');

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.json({limit: '5mb'}));

function runDiagnostics(numberOftries) {
  StartupDiagnostics.runStartupDiagnostics((errorBody) => {
    if (numberOftries <= 0) {
      process.exit(1);
    } else if (errorBody) {
      setTimeout(_.partial(runDiagnostics, numberOftries - 1), 10000);
    } else {
      initApp();
    }
  });
}

runDiagnostics(6);

function initApp() {
  var authenticationMethod = process.env.GEMTC_AUTHENTICATION_METHOD;
  setRequiredRights();
  var sessionOptions = {
    store: new (require('connect-pg-simple')(session))({
      conString: dbUtil.gemtcDBUrl
    }),
    secret: process.env.GEMTC_COOKIE_SECRET,
    resave: true,
    proxy: process.env.GEMTC_USE_PROXY,
    rolling: true,
    saveUninitialized: true,
    cookie: cookieSettings
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
  logger.info('Authentication method: ' + authenticationMethod);

  app.get('/logout', function (req, res) {
    req.session.destroy(function () {
      res.redirect('/');
    });
  });

  app.use(csurf());
  app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
      res.sendFile(__dirname + '/dist/index.html');
    } else {
      res.sendFile(__dirname + '/dist/signin.html');
    }
  });
  app.use(express.static('public'));
  app.use(express.static('dist'));
  app.get('/lexicon.json', function (req, res) {
    res.sendFile(__dirname + '/app/lexicon.json');
  });
  app.use('/css/fonts', express.static('./dist/fonts'));
  app.use(_.partial(loginUtils.setXSRFTokenMiddleware, cookieSettings));
  app.all('*', loginUtils.securityMiddleware);
  app.use('/user', function (req, res) {
    res.json(_.omit(req.user, ['username', 'id', 'password']));
  });
  app.use(rightsManagement.expressMiddleware);
  app.use('/patavi', mcdaPataviTaskRouter);
  app.use('/analyses', analysisRouter);
  app.use('/analyses/:analysisId/models', modelRouter);
  app.use(function (error, req, res, next) {
    if (res.headersSent) {
      return next(error);
    }
    if (error && error.type === signin.SIGNIN_ERROR) {
      res.status(StatusCodes.UNAUTHORIZED).send('login failed');
    } else {
      next(error);
    }
  });
  app.use(errorHandler);
  app.listen(3001);
}

function setRequiredRights() {
  rightsManagement.setRequiredRights([
    makeRights('/patavi', 'POST', 'none'),
    makeRights('/analyses', 'GET', 'none'),
    makeRights('/analyses', 'POST', 'none'),
    makeRights('/analyses/:analysisId', 'GET', 'read', ownerRightsNeeded),
    makeRights('/analyses/:analysisId', 'DELETE', 'owner', ownerRightsNeeded),
    makeRights(
      '/analyses/:analysisId/problem',
      'GET',
      'read',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/setPrimaryModel',
      'POST',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/setTitle',
      'PUT',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/setOutcome',
      'PUT',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/setProblem',
      'PUT',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models',
      'GET',
      'read',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models',
      'POST',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId',
      'GET',
      'read',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId',
      'POST',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId',
      'DELETE',
      'owner',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/task',
      'GET',
      'read',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/result',
      'GET',
      'read',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/baseline',
      'GET',
      'read',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/setTitle',
      'PUT',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/setSensitivity',
      'PUT',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/baseline',
      'PUT',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/attributes',
      'POST',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/funnelPlots',
      'GET',
      'read',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/funnelPlots',
      'POST',
      'write',
      ownerRightsNeeded
    ),
    makeRights(
      '/analyses/:analysisId/models/:modelId/funnelPlots/:plotId',
      'GET',
      'read',
      ownerRightsNeeded
    )
  ]);
}

function ownerRightsNeeded(response, next, workspaceId, userId) {
  AnalysisRepository.get(
    workspaceId,
    _.partial(rightsCallback, response, next, userId)
  );
}

function makeRights(path, method, requiredRight, checkRights) {
  return {
    path: path,
    method: method,
    requiredRight: requiredRight,
    checkRights: checkRights
  };
}
