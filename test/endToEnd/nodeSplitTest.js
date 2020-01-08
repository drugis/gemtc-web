'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

const TITLE = 'my title';
const OUTCOME = 'my outcome';
const NODE_SPLIT_MODEL_TITLE = 'Nodesplit model (Fluoxetine - Paroxetine)';

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addDefaultModel(browser)
    .click('#node-split-overview-link')
    .waitForElementVisible('#nodesplit-overview-header');
  browser
    .assert.containsText('#analysis-title-header', TITLE)
    .assert.containsText('#outcome-header', OUTCOME)
    .assert.containsText('#effects-type', 'random')
    .assert.containsText('#imputed-outcome-scale', '1.1321 (imputed)')
    .assert.containsText('#likelihood-link', 'binom / logit')
    .assert.containsText('#consistency-model-title', 'title')
    .assert.containsText('#random-effects-standard-deviation', '0.3').pause(100)
    .assert.containsText('#deviance-information-criterion', '26.');

  browser.click('#create-node-split-model-button-0')
    .waitForElementVisible('#create-model-header');
}

function afterEach(browser) {
  analysesService
    .deleteFromList(browser)
    .end();
}

function createNodeSplit(browser) {
  browser
    .click('#confirm-create-model-button')
    .assert.containsText('#model-title-0', NODE_SPLIT_MODEL_TITLE)
    .click('#run-model-button-0');

  browser
    .waitForElementVisible('#model-settings-section', 15000)
    .assert.containsText('#model-type', 'node-split')
    .click('#node-split-overview-link')
    .waitForElementVisible('#nodesplit-overview-header')
    .assert.containsText('#dic-0', '27.')
    .assert.containsText('#random-effects-standard-deviation-0', '0.4')
    ;
}

function missingtTitleAndCancel(browser) {
  browser.
    clearValue('#title-input')
    .waitForElementVisible('#missing-title-warning')
    .click('#close-model-button')
    .waitForElementVisible('#create-node-split-model-button-0');
}

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Create node split model from a consistency model': createNodeSplit,
  'Check missing title when createing nodesplit model from a consistency model': missingtTitleAndCancel
};
