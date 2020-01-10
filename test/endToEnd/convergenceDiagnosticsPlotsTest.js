'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Switch between convergence diagnostics plots': switchBetweenPlots
};

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService');

function checkPlotsContents(browser) {
  return browser
    .waitForElementVisible('#previous-plot-button:disabled')
    .assert.containsText('#comparison-plot-label', 'd.2.3 (Fluoxetine, Paroxetine)')
    .click('#next-plot-button')
    .assert.containsText('#comparison-plot-label', 'd.2.4 (Fluoxetine, Venlafaxine)')
    .click('#next-plot-button')
    .assert.containsText('#comparison-plot-label', 'd.2.5 (Fluoxetine, Sertraline)')
    .click('#next-plot-button')
    .assert.containsText('#comparison-plot-label', 'sd.d (Random effects standard deviation)')
    .waitForElementVisible('#next-plot-button:disabled')
    .click('#previous-plot-button')
    .click('#previous-plot-button')
    .click('#previous-plot-button');
}

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

function switchBetweenPlots(browser) {
  browser.click('#show-plots-button-0');
  checkPlotsContents(browser)
    .click('#density-plots');
  checkPlotsContents(browser)
    .click('#psrf-plots');
  checkPlotsContents(browser)
    .click('#close-modal-button');
}