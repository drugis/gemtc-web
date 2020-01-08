'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService');
const errorService = require('./util/errorService');

const chai = require('chai');

const TEST_URL = 'http://localhost:3001';
const TITLE = 'my title';
const OUTCOME = 'my outcome';

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
}

function afterEach(browser) {
  browser.end();
}

function loginPage(browser) {
  browser
    .url(TEST_URL)
    .waitForElementVisible('#signinButton')
    .getTitle(function(result) {
      chai.expect(result).to.equal('gemtc.drugis.org');
    });
  errorService.isErrorBarNotPresent(browser);
}

function analysesView(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header')
    .getTitle(function(result) {
      chai.expect(result).to.equal('dsgfdAnalyses');
    });
  errorService.isErrorBarHidden(browser);
}

function modelsView(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json')
    .getTitle(function(result) {
      chai.expect(result).to.equal(TITLE);
      analysesService.deleteFromList(browser);
    });
}

function modelResultsView(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addDefaultModel(browser)
    .getTitle(function(result) {
      chai.expect(result).to.equal('title');
      analysesService.deleteFromList(browser);
    });
}

function RefineModelView(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addDefaultModel(browser)
    .click('#refine-model-button')
    .getTitle(function(result) {
      chai.expect(result).to.equal('title');
      analysesService.deleteFromList(browser);
    });
}

function NodesplitOverview(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addDefaultModel(browser)
    .click('#node-split-overview-link')
    .getTitle(function(result) {
      chai.expect(result).to.equal('title');
      analysesService.deleteFromList(browser);
    });
}

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Login page, page title check': loginPage,
  'Analyses view': analysesView,
  'The models view': modelsView,
  'The model results view': modelResultsView,
  'Refine model view': RefineModelView,
  'Nodesplit overview': NodesplitOverview
};
