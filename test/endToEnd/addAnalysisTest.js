'use strict';
var loginService = require('./util/loginService');
var analysesService = require('./analyses/analysesService');
const constants = require('./util/constants');

module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1366, 728);
    loginService.login(browser)
      .waitForElementVisible('#analyses-header');
  },

  afterEach: function(browser) {
    browser.waitForElementVisible('#analysis-header')
      .assert.containsText('#analysis-title', constants.ANALYSIS_TITLE)
      .assert.containsText('#analysis-outcome', constants.OUTCOME);

    analysesService.deleteFromList(browser).end();
  },

  'Upload CSV file': function(browser) {
    analysesService.addAnalysis(browser, '/example.csv');
  },

  'Upload relative CSV file': function(browser) {
    analysesService.addAnalysis(browser, '/parkinson-rel.csv');
  },

  'Upload semicolon-separated CSV file': function(browser) {
    analysesService.addAnalysis(browser, '/european-example.csv');
  },

  'Upload JSON file': function(browser) {
    analysesService.addDefaultAnalysis(browser);
  }
};
