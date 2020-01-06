'use strict';
var loginService = require('./util/loginService');
var analysesService = require('./analyses/analysesService');

var TITLE = 'my title';
var OUTCOME = 'my outcome';

module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1366, 728);
    loginService.login(browser)
      .waitForElementVisible('#analyses-header');
  },

  afterEach: function(browser) {
    browser.waitForElementVisible('#analysis-header')
      .assert.containsText('#analysisTitle', TITLE)
      .assert.containsText('#analysisOutcome', OUTCOME);

    analysesService.deleteFromList(browser).end();
  },

  'Upload CSV file': function(browser) {
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.csv');
  },

  'Upload relative CSV file': function(browser) {
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/parkinson-rel.csv');
  },

  'Upload semicolon-separated CSV file': function(browser) {
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/european-example.csv');
  },

  'Upload JSON file': function(browser) {
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  }
};
