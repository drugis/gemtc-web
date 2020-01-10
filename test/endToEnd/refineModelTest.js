'use strict';

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

const MODEL_TITLE = constants.MODEL_TITLE;

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, constants.ANALYSIS_TITLE, constants.OUTCOME, '/example.json');
  modelService.addDefaultModel(browser);
}

function afterEach(browser) {
  analysesService
    .deleteFromList(browser)
    .end();
}

function refineModel(browser) {
  const newModelTitle = 'new title';
  browser
    .click('#refine-model-button')
    .waitForElementVisible('#create-model-header')
    .setValue('#title-input', newModelTitle)
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', 10000)
    .click('#breadcrumbs-analysis')
    .waitForElementVisible('#analysis-header')
    .assert.containsText('#model-0', MODEL_TITLE)
    .assert.containsText('#model-0', newModelTitle);
}

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Refine model': refineModel
};
