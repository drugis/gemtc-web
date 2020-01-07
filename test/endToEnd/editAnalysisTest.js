'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');

const TITLE = 'my title';
const OUTCOME = 'my outcome';
const NEW_TITLE = 'new title';

function doCommonThings(browser, titleOrOutcome, oldValue) {
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  return browser
    .assert.containsText('#analysis-' + titleOrOutcome, oldValue)
    .click('#edit-analysis-' + titleOrOutcome + '-button')
    .waitForElementVisible('#analysis-' + titleOrOutcome + '-input')
    .clearValue('#analysis-' + titleOrOutcome + '-input')
    .setValue('#analysis-' + titleOrOutcome + '-input', NEW_TITLE)
    ;
}

module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1366, 728);
    loginService.login(browser)
      .waitForElementVisible('#analyses-header');
  },

  afterEach: function(browser) {
    analysesService.deleteFromList(browser).end();
  },

  'Edit analysis title': function(browser) {
    doCommonThings(browser, 'title', TITLE)
      .click('#confirm-edit-analysis-title-button')
      .assert.containsText('#analysis-title', NEW_TITLE);
  },

  'Cancel editing analysis title': function(browser) {
    doCommonThings(browser, 'title', TITLE)
      .click('#close-modal-button')
      .assert.containsText('#analysis-title', TITLE);
  },

  'Edit analysis outcome': function(browser) {
    doCommonThings(browser, 'outcome', OUTCOME)
      .click('#confirm-edit-analysis-outcome-button')
      .assert.containsText('#analysis-outcome', NEW_TITLE);
  },

  'Cancel editing analysis outcome': function(browser) {
    doCommonThings(browser, 'outcome', OUTCOME)
      .click('#close-modal-button')
      .assert.containsText('#analysis-outcome', OUTCOME);
  }
};
