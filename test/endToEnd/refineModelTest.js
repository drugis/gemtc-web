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
    modelService.addDefaultModel(browser);
  },

  afterEach: function(browser) {
    analysesService
      .deleteFromList(browser)
      .end();
  },

  'Refine model': function(browser) {
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
};
