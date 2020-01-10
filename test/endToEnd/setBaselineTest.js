'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Set baseline distribution': setBaseline,
  'Set invalid baseline distribution': setInvalidBaseline,
  'Cancel setting baseline distribution': cancelSetBaseline
};

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService');

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addDefaultAnalysis(browser);
  modelService.addDefaultModel(browser);
}

function afterEach(browser) {
  analysesService
    .deleteFromList(browser)
    .end();
}

function setBaseline(browser) {
  browser
    .waitForElementVisible('#no-baseline-warning')
    .click('#set-baseline-distribution-button')
    .waitForElementVisible('#set-baseline-header')
    .click('#confirm-set-baseline-button')
    .waitForElementVisible('#absolute-effects-table');
}

function setInvalidBaseline(browser) {
  browser
    .waitForElementVisible('#no-baseline-warning')
    .click('#set-baseline-distribution-button')
    .waitForElementVisible('#set-baseline-header')
    .clearValue('#alpha-parameter-input')
    .waitForElementVisible('#confirm-set-baseline-button:disabled')
    .click('#close-modal-button');
}

function cancelSetBaseline(browser) {
  browser
    .waitForElementVisible('#no-baseline-warning')
    .click('#set-baseline-distribution-button')
    .waitForElementVisible('#set-baseline-header')
    .click('#close-modal-button')
    .waitForElementVisible('#no-baseline-warning');
}
