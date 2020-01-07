'use strict';

function addAnalysis(browser, title, outcome, filename) {
  browser
    .waitForElementVisible('#add-analysis-button')
    .click('#add-analysis-button')
    .waitForElementVisible('h3')
    .setValue('#title-input', title)
    .setValue('#outcome-input', outcome)
    .setValue('#problem-file-upload', require('path').resolve(__dirname + filename))
    .click('#submit-add-analysis-button');
  return browser;
}

function deleteFromList(browser, index = 0) {
  browser
    .click('#logo')
    .click('#analysis-delete-' + index)
    .click('#delete-confirm-button')
    .waitForElementVisible('#empty-analyses-message');
  return browser;
}

module.exports = {
  addAnalysis: addAnalysis,
  deleteFromList: deleteFromList
};
