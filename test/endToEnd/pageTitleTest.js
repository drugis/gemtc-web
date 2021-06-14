'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Login page': loginPage,
  'Analyses view': analysesView,
  'The models view': modelsView,
  'The model titles view': modeltitlesView,
  'Refine model view': RefineModelView,
  'Nodesplit overview': NodesplitOverview
};

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService');
const errorService = require('./util/errorService');

function addAnalysisAndModel(browser) {
  loginService.login(browser).waitForElementVisible('#analyses-header');
  analysesService.addDefaultAnalysis(browser);
  modelService.addDefaultModel(browser);
  return browser;
}

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
}

function afterEach(browser) {
  browser.end();
}

function loginPage(browser) {
  browser
    .url(constants.TEST_URL)
    .waitForElementVisible('#signinButton')
    .getTitle(function (title) {
      browser.assert.equal(title, 'gemtc.drugis.org');
    });
  errorService.isErrorBarNotPresent(browser);
}

function analysesView(browser) {
  loginService
    .login(browser)
    .waitForElementVisible('#analyses-header')
    .getTitle(function (title) {
      browser.assert.equal(title, 'Analyses');
    });
  errorService.isErrorBarHidden(browser);
}

function modelsView(browser) {
  loginService.login(browser).waitForElementVisible('#analyses-header');
  analysesService.addDefaultAnalysis(browser).getTitle(function (title) {
    browser.assert.equal(title, constants.ANALYSIS_TITLE);
    analysesService.deleteFromList(browser);
  });
}

function modeltitlesView(browser) {
  addAnalysisAndModel(browser).getTitle(function (title) {
    browser.assert.equal(title, constants.MODEL_TITLE);
    analysesService.deleteFromList(browser);
  });
}

function RefineModelView(browser) {
  addAnalysisAndModel(browser)
    .click('#refine-model-button')
    .waitForElementVisible('#create-model-header')
    .getTitle(function (title) {
      browser.assert.equal(title, 'Refine model');
      analysesService.deleteFromList(browser);
    });
}

function NodesplitOverview(browser) {
  addAnalysisAndModel(browser)
    .click('#node-split-overview-link')
    .getTitle(function (title) {
      browser.assert.equal(title, constants.MODEL_TITLE);
      analysesService.deleteFromList(browser);
    });
}
