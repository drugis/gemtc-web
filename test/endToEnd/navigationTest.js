'use strict';
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const util = require('./util/util');

const TITLE = 'my title';
const OUTCOME = 'my outcome';

module.exports = {
  afterEach: function(browser) {
    browser.end();
  },

  'Open manual from login page': function(browser) {
    browser
      .url('http://localhost:3001')
      .waitForElementVisible('#manual-link')
      .click('#manual-link')
      .windowHandles(function(result) {
        browser.switchWindow(result.value[1])
          .waitForElementVisible('#manual-title-header');
      });
  },

  'Open manual while logged in': function(browser) {
    loginService.login(browser)
      .click('#manual-link')
      .windowHandles(function(result) {
        browser.switchWindow(result.value[1])
          .waitForElementVisible('#manual-title-header');
      });
  },

  'Home navigation from login name': function(browser) {
    loginService.login(browser);
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
    util.delayedClick(browser, '#user-image-link', '#create-workspace-button');
    analysesService
      .deleteFromList(browser);
  },

  'Navigate to problem that does not exists through URL manipulation': function(browser) {
    loginService.login(browser)
      .url('http://localhost:3001/#!/analyses/0/models/1')
      .useXpath()
      .waitForElementVisible('/html/body/error-reporting')
      .useCss();
  }
};
