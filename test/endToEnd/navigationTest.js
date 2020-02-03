'use strict';

module.exports = {
  afterEach: afterEach,
  'Open manual from login page': openManualLoginPage,
  'Open manual while logged in': openManualLoggedIn,
  'Home navigation from login name': goHomeLoginName,
  'Navigate to problem that does not exists through URL manipulation': wrongUrlNavigation
};

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const util = require('./util/util');

function afterEach(browser) {
  browser.end();
}

function openManualLoginPage(browser) {
  browser
    .url(constants.TEST_URL)
    .waitForElementVisible('#manual-link')
    .click('#manual-link')
    .windowHandles(function(result) {
      browser.switchWindow(result.value[1])
        .waitForElementVisible('#manual-title-header');
    });
}

function openManualLoggedIn(browser) {
  loginService.login(browser)
    .click('#manual-link')
    .windowHandles(function(result) {
      browser.switchWindow(result.value[1])
        .waitForElementVisible('#manual-title-header');
    });
}

function goHomeLoginName(browser) {
  loginService.login(browser);
  analysesService.addDefaultAnalysis(browser);
  util.delayedClick(browser, '#user-image-link', '#add-analysis-button');
  analysesService
    .deleteFromList(browser);
}

function wrongUrlNavigation(browser) {
  loginService.login(browser)
    .url(constants.TEST_URL + '/#!/analyses/0/models/1')
    .useXpath()
    .waitForElementVisible('/html/body/error-reporting')
    .useCss();
}
