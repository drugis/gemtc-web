'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Edit model title': editTitle,
  'Cancel editing model title': cancelEditTitle,
  'Delete model': deleteModel,
  'Cancel deleting model': cancelDeleteModel
};

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService');

const NEW_MODEL_TITLE = 'new title';

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addDefaultAnalysis(browser);
  modelService.addDefaultModel(browser)
    .click('#breadcrumbs-analysis')
    .waitForElementVisible('#analysis-header');
}

function afterEach(browser) {
  analysesService
    .deleteFromList(browser)
    .end();
}

function editTitle(browser) {
  
  browser
    .assert.containsText('#model-0', constants.MODEL_TITLE)
    .click('#edit-model-title-0')
    .waitForElementVisible('#edit-model-title-header')
    .clearValue('#model-title-input')
    .waitForElementVisible('#confirm-model-title-edit-button:disabled')
    .setValue('#model-title-input', NEW_MODEL_TITLE)
    .click('#confirm-model-title-edit-button')
    .assert.containsText('#model-0', NEW_MODEL_TITLE);
}

function cancelEditTitle(browser) {
  browser
    .assert.containsText('#model-0', constants.MODEL_TITLE)
    .click('#edit-model-title-0')
    .waitForElementVisible('#edit-model-title-header')
    .clearValue('#model-title-input')
    .waitForElementVisible('#confirm-model-title-edit-button:disabled')
    .setValue('#model-title-input', NEW_MODEL_TITLE)
    .click('#close-modal-button')
    .assert.containsText('#model-0', constants.MODEL_TITLE);
}

function deleteModel(browser) {
  browser
    .assert.containsText('#model-0', constants.MODEL_TITLE)
    .click('#delete-model-0')
    .waitForElementVisible('#delete-model-header')
    .click('#confirm-delete-model-button')
    .waitForElementVisible('#no-models-message');
}

function cancelDeleteModel(browser) {
  browser
    .assert.containsText('#model-0', constants.MODEL_TITLE)
    .click('#delete-model-0')
    .waitForElementVisible('#delete-model-header')
    .click('#close-modal-button')
    .assert.containsText('#model-0', constants.MODEL_TITLE);
}
