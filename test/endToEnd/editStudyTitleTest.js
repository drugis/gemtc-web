'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');

const TITLE = 'my title';
const OUTCOME = 'my outcome';
const STUDY_TITLE = 'Rudolph and Feiger, 1999';
const NEW_TITLE = 'new title';

module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1366, 728);
    loginService.login(browser)
      .waitForElementVisible('#analyses-header');
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json')
      .assert.containsText('#study-title-0', STUDY_TITLE)
      .click('#edit-study-title-0')
      .waitForElementVisible('#study-title-input')
      .waitForElementVisible('#edit-study-title-warning')
      .clearValue('#study-title-input');
  },

  afterEach: function(browser) {
    analysesService.deleteFromList(browser).end();
  },

  'Edit study title': function(browser) {
    browser
      .setValue('#study-title-input', NEW_TITLE)
      .click('#confirm-edit-study-title-button')
      .assert.containsText('#study-title-0', NEW_TITLE);
  },

  'Empty study title error': function(browser) {
    browser
      .assert.containsText('#edit-study-title-error', 'Title is empty')
      .waitForElementVisible('#confirm-edit-study-title-button:disabled')
      .click('#close-modal-button')
      .assert.containsText('#study-title-0', STUDY_TITLE);
  },

  'Duplicate study title error': function(browser) {
    browser
      .setValue('#study-title-input', 'De Wilde et al, 1993')
      .assert.containsText('#edit-study-title-error', 'Study with that title already exists')
      .waitForElementVisible('#confirm-edit-study-title-button:disabled')
      .click('#close-modal-button')
      .assert.containsText('#study-title-0', STUDY_TITLE);
  },

  'Cancel editing study title': function(browser) {
    browser
      .setValue('#study-title-input', NEW_TITLE)
      .click('#close-modal-button')
      .assert.containsText('#study-title-0', STUDY_TITLE);
  }
};
