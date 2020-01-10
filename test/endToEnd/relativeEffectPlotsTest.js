'use strict';

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

const TITLE = constants.ANALYSIS_TITLE;
const OUTCOME = constants.OUTCOME;

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
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

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Switch between relative effects plots': switchBetweenPlots
};
