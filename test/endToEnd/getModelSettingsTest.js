'use strict';

const constants = require('./util/constants');
const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
  analysesService.addAnalysis(browser, constants.ANALYSIS_TITLE, constants.OUTCOME, '/example.json');
  modelService.addDefaultModel(browser);
}

function afterEach(browser) {
  analysesService
    .deleteFromList(browser)
    .end();
}

function getModelData(browser) {
  browser
    .click('#get-model-data-button')
    .windowHandles(function(result) {
      browser
        .switchWindow(result.value[1])
        .waitForElementVisible('body')
        .switchWindow(result.value[0]);
    });
}

function getRScript(browser) {
  browser
    .click('#get-r-script-button')
    .windowHandles(function(result) {
      browser
        .switchWindow(result.value[1])
        .waitForElementVisible('body')
        .switchWindow(result.value[0]);
    });
}
module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Get model data': getModelData,
  'Get R script': getRScript
};
