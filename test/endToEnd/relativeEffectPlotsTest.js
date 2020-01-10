'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Switch between relative effects plots': switchBetweenPlots
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

function switchBetweenPlots(browser) {
  browser
    .click('#relative-effect-plot-selector')
    .click('option[label=Paroxetine]');
}
