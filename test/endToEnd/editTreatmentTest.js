'use strict';

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');

const TITLE = constants.ANALYSIS_TITLE;
const OUTCOME = constants.OUTCOME;
const TREATMENT_TITLE = 'Venlafaxine';
const NEW_TITLE = 'new title';

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json')
    .assert.containsText('#treatment-title-0', TREATMENT_TITLE)
    .click('#edit-treatment-title-0')
    .waitForElementVisible('#treatment-title-input')
    .waitForElementVisible('#edit-treatment-title-warning')
    .clearValue('#treatment-title-input');
}

function afterEach(browser) {
  analysesService
    .deleteFromList(browser)
    .end();
}

function editTitle(browser) {
  browser
    .setValue('#treatment-title-input', NEW_TITLE)
    .click('#confirm-edit-treatment-title-button')
    .assert.containsText('#treatment-title-0', NEW_TITLE);
}

function emptyTitle(browser) {
  browser
    .assert.containsText('#edit-treatment-title-error', 'Name is empty')
    .waitForElementVisible('#confirm-edit-treatment-title-button:disabled')
    .click('#close-modal-button')
    .assert.containsText('#treatment-title-0', TREATMENT_TITLE);
}

function duplicateTitle(browser) {
  browser
    .setValue('#treatment-title-input', 'Fluoxetine')
    .assert.containsText('#edit-treatment-title-error', 'Treatment with that name already exists')
    .waitForElementVisible('#confirm-edit-treatment-title-button:disabled')
    .click('#close-modal-button')
    .assert.containsText('#treatment-title-0', TREATMENT_TITLE);
}

function cancelEdit(browser) {
  browser
    .setValue('#treatment-title-input', NEW_TITLE)
    .click('#close-modal-button')
    .assert.containsText('#treatment-title-0', TREATMENT_TITLE);
}

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Edit treatment title': editTitle,
  'Empty treatment title error': emptyTitle,
  'Duplicate treatment title error': duplicateTitle,
  'Cancel editing treatment title': cancelEdit
};
