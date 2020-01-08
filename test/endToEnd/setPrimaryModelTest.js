'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

const MODEL_TITLE = 'title';

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, 'my title', 'my outcome', '/example.json');
  modelService.addDefaultModel(browser)
    .click('#breadcrumbs-analysis')
    .waitForElementVisible('#analysis-header')
    .waitForElementVisible('#unset-primary-model-button:disabled')
    .expect.element('#model-0').text.to.equal(MODEL_TITLE);
  browser.expect.element('option[selected="selected"]').text.to.equal('');
  browser
    .click('#primary-model-selector')
    .click('option[label="' + MODEL_TITLE + '"]')
    .assert.containsText('#model-0', MODEL_TITLE + ' (primary model)')
    .waitForElementVisible('#delete-disabled-model-0');
}

function afterEach(browser) {
  analysesService
    .deleteFromList(browser)
    .end();
}

function unsetPrimaryModel(browser) {
  browser.click('#unset-primary-model-button');
  browser.expect.element('option[selected="selected"]').text.to.equal('');
  browser.expect.element('#model-0').text.to.equal(MODEL_TITLE);
}

function switchPrimaryModel(browser) {
  const otherModelTitle = 'title 2';
  modelService.addDefaultModel(browser, otherModelTitle)
    .click('#breadcrumbs-analysis');
  browser.expect.element('#model-1').text.to.equal(otherModelTitle);
  browser
    .click('#primary-model-selector')
    .click('option[label="' + otherModelTitle + '"]')
    .assert.containsText('#model-1', otherModelTitle + ' (primary model)')
    .expect.element('#model-0').text.to.equal(MODEL_TITLE);
}

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Unset a primary model': unsetPrimaryModel,
  'Switching the primary model': switchPrimaryModel
  // delete not available
};
