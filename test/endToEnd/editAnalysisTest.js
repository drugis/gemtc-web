'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Edit analysis title': editAnalysisTitle,
  'Cancel editing analysis title': cancelEditAnalysisTitle,
  'Edit analysis outcome': editAnalysisOutcome,
  'Cancel editing analysis outcome': cancelEditAnalysisOutcome
};

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');

const NEW_TITLE = 'new title';

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
}

function afterEach(browser) {
  analysesService.deleteFromList(browser).end();
}

function doCommonThings(browser, titleOrOutcome, oldValue) {
  analysesService.addDefaultAnalysis(browser);
  return browser
    .assert.containsText('#analysis-' + titleOrOutcome, oldValue)
    .click('#edit-analysis-' + titleOrOutcome + '-button')
    .waitForElementVisible('#analysis-' + titleOrOutcome + '-input')
    .clearValue('#analysis-' + titleOrOutcome + '-input')
    .setValue('#analysis-' + titleOrOutcome + '-input', NEW_TITLE)
    ;
}

function editAnalysisTitle(browser) {
  doCommonThings(browser, 'title', constants.ANALYSIS_TITLE)
    .click('#confirm-edit-analysis-title-button')
    .assert.containsText('#analysis-title', NEW_TITLE);
}

function cancelEditAnalysisTitle(browser) {
  doCommonThings(browser, 'title', constants.ANALYSIS_TITLE)
    .click('#close-modal-button')
    .assert.containsText('#analysis-title', constants.ANALYSIS_TITLE);
}

function editAnalysisOutcome(browser) {
  doCommonThings(browser, 'outcome', constants.OUTCOME)
    .click('#confirm-edit-analysis-outcome-button')
    .assert.containsText('#analysis-outcome', NEW_TITLE);
}

function cancelEditAnalysisOutcome(browser) {
  doCommonThings(browser, 'outcome', constants.OUTCOME)
    .click('#close-modal-button')
    .assert.containsText('#analysis-outcome', constants.OUTCOME);
}