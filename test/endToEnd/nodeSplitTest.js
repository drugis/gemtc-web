'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Create node split model from a consistency model': createNodeSplit,
  'Check missing title when creating nodesplit model from a consistency model':
    missingtTitleAndCancel,
  'Create consistency model from a node split model': createConsistencyModel
};

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService');

const NODE_SPLIT_MODEL_TITLE = 'Nodesplit model (Fluoxetine - Paroxetine)';

function checkNodeSplitOverviewForConsistencyModel(browser) {
  modelService
    .addDefaultModel(browser)
    .click('#node-split-overview-link')
    .waitForElementVisible('#nodesplit-overview-header');
  browser.assert
    .containsText('#analysis-title-header', constants.ANALYSIS_TITLE)
    .assert.containsText('#outcome-header', constants.OUTCOME)
    .assert.containsText('#effects-type', 'random')
    .assert.containsText('#imputed-outcome-scale', '1.13')
    .assert.containsText('#imputed-outcome-scale', '(imputed)')
    .assert.containsText('#likelihood-link', 'binom / logit')
    .assert.containsText('#consistency-model-title', constants.MODEL_TITLE)
    .assert.containsText('#random-effects-standard-deviation', '0.3')
    .pause(100)
    .assert.containsText('#deviance-information-criterion', '26.');

  browser
    .click('#create-node-split-model-button-0')
    .waitForElementVisible('#create-model-header');
}

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser).waitForElementVisible('#analyses-header');
  analysesService.addDefaultAnalysis(browser);
}

function afterEach(browser) {
  analysesService.deleteFromList(browser).end();
}

function createNodeSplit(browser) {
  checkNodeSplitOverviewForConsistencyModel(browser);
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
    .assert.containsText('#random-effects-standard-deviation-0', '0.4');
}

function missingtTitleAndCancel(browser) {
  checkNodeSplitOverviewForConsistencyModel(browser);
  browser
    .clearValue('#title-input')
    .waitForElementVisible('#missing-title-warning')
    .click('#close-model-button')
    .waitForElementVisible('#create-node-split-model-button-0');
}

function createConsistencyModel(browser) {
  const modelSettings = {
    title: constants.MODEL_TITLE,
    effectsType: '#random-effect-radio',
    modelMainType: '#node-split-model-main-type-radio',
    modelSubType: '#node-split-specific-type-radio'
  };
  const networkModelTitle = 'Network model';

  modelService
    .addModel(browser, modelSettings)
    .click('#node-split-overview-link')
    .waitForElementVisible('#nodesplit-overview-header');
  browser
    .click('#create-consistency-model-button')
    .click('#confirm-create-model-button')
    .assert.containsText('#consistency-model-title', networkModelTitle)
    .click('#run-network-model-button')
    .waitForElementVisible(
      '#model-settings-section',
      constants.MODEL_WAIT_TIME_OUT
    );
  modelService.verifyNetworkModelContents(browser, networkModelTitle);
}
