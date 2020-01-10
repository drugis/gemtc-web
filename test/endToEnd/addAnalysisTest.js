'use strict';
var loginService = require('./util/loginService');
var analysesService = require('./analyses/analysesService');
const constants = require('./util/constants');

var TITLE = constants.ANALYSIS_TITLE;
var OUTCOME = constants.OUTCOME;

module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1366, 728);
    loginService.login(browser)
      .waitForElementVisible('#analyses-header');
  },

  afterEach: function(browser) {
    browser.waitForElementVisible('#analysis-header')
      .assert.containsText('#analysis-title', TITLE)
      .assert.containsText('#analysis-outcome', OUTCOME);

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
