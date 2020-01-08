'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

const MODEL_TITLE = 'title';

module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1366, 728);
    loginService.login(browser)
      .waitForElementVisible('#analyses-header');
    analysesService.addAnalysis(browser, 'my title', 'my outcome', '/example.json');
    modelService.addDefaultModel(browser)
      .click('#breadcrumbs-analysis')
      .waitForElementVisible('#analysis-header');
  },

  afterEach: function(browser) {
    analysesService
      .deleteFromList(browser)
      .end();
  },

  'Edit model title': function(browser) {
    const newModelTitle = 'new title';
    browser
    .assert.containsText('#model-0', MODEL_TITLE)
    .click('#edit-model-title-0')
    .waitForElementVisible('#edit-model-title-header')
    .clearValue('#model-title-input')
    .waitForElementVisible('#confirm-model-title-edit-button:disabled')
    .setValue('#model-title-input', newModelTitle)
    .click('#confirm-model-title-edit-button')
    .assert.containsText('#model-0', newModelTitle);
  },

  'Cancel editing model title': function(browser) {
    const newModelTitle = 'new title';
    browser
    .assert.containsText('#model-0', MODEL_TITLE)
    .click('#edit-model-title-0')
    .waitForElementVisible('#edit-model-title-header')
    .clearValue('#model-title-input')
    .waitForElementVisible('#confirm-model-title-edit-button:disabled')
    .setValue('#model-title-input', newModelTitle)
    .click('#close-modal-button')
    .assert.containsText('#model-0', MODEL_TITLE);
  },

  'Delete model': function(browser) {
    browser
    .assert.containsText('#model-0', MODEL_TITLE)
    .click('#delete-model-0')
    .waitForElementVisible('#delete-model-header')
    .click('#confirm-delete-model-button')
    .waitForElementVisible('#no-models-message');
  },

  'Cancel deleting model': function(browser) {
    browser
    .assert.containsText('#model-0', MODEL_TITLE)
    .click('#delete-model-0')
    .waitForElementVisible('#delete-model-header')
    .click('#close-modal-button')
    .assert.containsText('#model-0', MODEL_TITLE);
  }
};
