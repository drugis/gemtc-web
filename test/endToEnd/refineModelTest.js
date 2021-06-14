'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Refine model': refineModel
};

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService');

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser).waitForElementVisible('#analyses-header');
  analysesService.addDefaultAnalysis(browser);
  modelService.addDefaultModel(browser);
}

function afterEach(browser) {
  analysesService.deleteFromList(browser).end();
}

function refineModel(browser) {
  const newModelTitle = 'new title';
  browser
    .click('#refine-model-button')
    .waitForElementVisible('#create-model-header')
    .setValue('#title-input', newModelTitle)
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', 20000)
    .click('#breadcrumbs-analysis')
    .waitForElementVisible('#analysis-header')
    .assert.containsText('#model-0', constants.MODEL_TITLE)
    .assert.containsText('#model-0', newModelTitle);
}
