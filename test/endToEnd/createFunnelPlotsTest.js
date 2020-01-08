'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, 'my title', 'my outcome', '/example.json');
  modelService.addDefaultModel(browser);
}

function afterEach(browser) {
  analysesService
    .deleteFromList(browser)
    .end();
}

function addFunnelPlot(browser) {
  browser
    .waitForElementVisible('#no-funnel-plots-message')
    .click('#add-funnel-plots-button')
    .waitForElementVisible('#add-funnel-plots-header')
    .waitForElementVisible('#confirm-add-funnel-plots-button:disabled')
    .click('#select-all-button')
    .click('#confirm-add-funnel-plots-button')
    .waitForElementVisible('#funnel-plots-container')
    ;
}

function cancelFunnelPlot(browser) {
  browser
    .waitForElementVisible('#no-funnel-plots-message')
    .click('#add-funnel-plots-button')
    .waitForElementVisible('#add-funnel-plots-header')
    .waitForElementVisible('#confirm-add-funnel-plots-button:disabled')
    .click('#select-all-button')
    .click('#close-modal-button')
    .waitForElementVisible('#no-funnel-plots-message')
    ;
}

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Add comparison-adjusted funnel plots': addFunnelPlot,
  'Cancel adding comparison-adjusted funnel plots': cancelFunnelPlot
}
