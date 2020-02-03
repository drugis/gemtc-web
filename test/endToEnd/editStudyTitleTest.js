'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Edit study title': editStudyTitle,
  'Empty study title error': emptyStudyTitle,
  'Duplicate study title error': duplicateStudyTitle,
  'Cancel editing study title': cancelEditStudyTitle
};

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');

const STUDY_TITLE = 'Rudolph and Feiger, 1999';
const NEW_TITLE = 'new title';

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addDefaultAnalysis(browser)
    .assert.containsText('#study-title-0', STUDY_TITLE)
    .click('#edit-study-title-0')
    .waitForElementVisible('#study-title-input')
    .waitForElementVisible('#edit-study-title-warning')
    .clearValue('#study-title-input');
}

function afterEach(browser) {
  analysesService.deleteFromList(browser).end();
}

function editStudyTitle(browser) {
  browser
    .setValue('#study-title-input', NEW_TITLE)
    .click('#confirm-edit-study-title-button')
    .assert.containsText('#study-title-0', NEW_TITLE);
}

function emptyStudyTitle(browser) {
  browser
    .assert.containsText('#edit-study-title-error', 'Title is empty')
    .waitForElementVisible('#confirm-edit-study-title-button:disabled')
    .click('#close-modal-button')
    .assert.containsText('#study-title-0', STUDY_TITLE);
}

function duplicateStudyTitle(browser) {
  browser
    .setValue('#study-title-input', 'De Wilde et al, 1993')
    .assert.containsText('#edit-study-title-error', 'Study with that title already exists')
    .waitForElementVisible('#confirm-edit-study-title-button:disabled')
    .click('#close-modal-button')
    .assert.containsText('#study-title-0', STUDY_TITLE);
}

function cancelEditStudyTitle(browser) {
  browser
    .setValue('#study-title-input', NEW_TITLE)
    .click('#close-modal-button')
    .assert.containsText('#study-title-0', STUDY_TITLE);
}