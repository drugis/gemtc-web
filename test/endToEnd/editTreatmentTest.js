'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');

const TITLE = 'my title';
const OUTCOME = 'my outcome';
const TREATMENT_TITLE = 'Venlafaxine';
const NEW_TITLE = 'new title';

module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1366, 728);
    loginService.login(browser)
      .waitForElementVisible('#analyses-header');
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json')
      .assert.containsText('#treatment-title-0', TREATMENT_TITLE)
      .click('#edit-treatment-title-0')
      .waitForElementVisible('#treatment-title-input')
      .waitForElementVisible('#edit-treatment-title-warning')
      .clearValue('#treatment-title-input');
  },

  afterEach: function(browser) {
    analysesService
      .deleteFromList(browser)
      .end();
  },

  'Edit treatment title': function(browser) {
    browser
      .setValue('#treatment-title-input', NEW_TITLE)
      .click('#confirm-edit-treatment-title-button')
      .assert.containsText('#treatment-title-0', NEW_TITLE);
  },

  'Empty treatment title error': function(browser) {
    browser
      .assert.containsText('#edit-treatment-title-error', 'Name is empty')
      .waitForElementVisible('#confirm-edit-treatment-title-button:disabled')
      .click('#close-modal-button')
      .assert.containsText('#treatment-title-0', TREATMENT_TITLE);
  },

  'Duplicate treatment title error': function(browser) {
    browser
      .setValue('#treatment-title-input', 'Fluoxetine')
      .assert.containsText('#edit-treatment-title-error', 'Treatment with that name already exists')
      .waitForElementVisible('#confirm-edit-treatment-title-button:disabled')
      .click('#close-modal-button')
      .assert.containsText('#treatment-title-0', TREATMENT_TITLE);
  },

  'Cancel editing treatment title': function(browser) {
    browser
      .setValue('#treatment-title-input', NEW_TITLE)
      .click('#close-modal-button')
      .assert.containsText('#treatment-title-0', TREATMENT_TITLE);
  }
};
