'use strict';

module.exports = {
  addAnalysis: addAnalysis,
  addDefaultAnalysis: addDefaultAnalysis,
  deleteFromList: deleteFromList
};

const constants = require('../util/constants');

function addAnalysis(browser, filename, title = constants.ANALYSIS_TITLE, outcome = constants.OUTCOME) {
  browser
    .waitForElementVisible('#add-analysis-button')
    .click('#add-analysis-button')
    .waitForElementVisible('h3')
    .setValue('#title-input', title)
    .setValue('#outcome-input', outcome)
    .setValue('#problem-file-upload', require('path').resolve(__dirname + filename))
    .click('#submit-add-analysis-button')
    .waitForElementVisible('#analysis-header');
  return browser;
}

function addDefaultAnalysis(browser) {
  return addAnalysis(browser, constants.DEFAULT_ANALYSIS);
}

function deleteFromList(browser, index = 0) {
  browser
    .click('#logo')
    .click('#analysis-delete-' + index)
    .click('#delete-confirm-button')
    .waitForElementVisible('#empty-analyses-message');
  return browser;
}
