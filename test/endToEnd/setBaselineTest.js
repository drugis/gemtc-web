'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

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

  'Set baseline distribution': function(browser) {
    browser
      .waitForElementVisible('#no-baseline-warning')
      .click('#set-baseline-distribution-button')
      .waitForElementVisible('#set-baseline-header')
      .click('#confirm-set-baseline-button')
      .waitForElementVisible('#absolute-effects-table');
  },

  'Set invalid baseline distribution': function(browser) {
    browser
      .waitForElementVisible('#no-baseline-warning')
      .click('#set-baseline-distribution-button')
      .waitForElementVisible('#set-baseline-header')
      .clearValue('#alpha-parameter-input')
      .waitForElementVisible('#confirm-set-baseline-button:disabled')
      .click('#close-modal-button');
  },

  'Cancel setting baseline distribution': function(browser) {
    browser
      .waitForElementVisible('#no-baseline-warning')
      .click('#set-baseline-distribution-button')
      .waitForElementVisible('#set-baseline-header')
      .click('#close-modal-button')
      .waitForElementVisible('#no-baseline-warning');
  }
};
