'use strict';

module.exports = {
  addDefaultModel: addDefaultModel,
  addModel: addModel,
  addModelWithPrior: addModelWithPrior,
  addModelWithRunLengthParameters: addModelWithRunLengthParameters,
  addModelWithLeaveOneOut: addModelWithLeaveOneOut,
  addDesignAdjustedModel: addDesignAdjustedModel,
  verifyCommonContent: verifyCommonContent,
  verifyNetworkModelContents: verifyNetworkModelContents
};

const constants = require('../util/constants');

function addDefaultModel(browser, modelTitle = 'title') {
  return browser
    .waitForElementVisible('#add-model-button')
    .click('#add-model-button')
    .setValue('#title-input', modelTitle)
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', constants.MODEL_WAIT_TIME_OUT);
}

function addModel(browser, modelSettings) {
  beforeEach(browser, modelSettings)
    .click(modelSettings.modelSubType)
    .click('#submit-add-model-button');
  if (!modelSettings.dontWaitForResults) {
    browser.waitForElementVisible('#model-settings-section', constants.MODEL_WAIT_TIME_OUT);
  }
  return browser;
}

function addModelWithPrior(browser, modelSettings) {
  return beforeEach(browser, modelSettings)
    .click(modelSettings.modelSubType)
    .click('#heterogeneity-prior-variance-radio')
    .setValue('#heterogeneity-log-n-parameter1-input', 3)
    .setValue('#heterogeneity-log-n-parameter2-input', 0.2)
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', constants.MODEL_WAIT_TIME_OUT);
}

function addModelWithRunLengthParameters(browser, modelSettings) {
  return beforeEach(browser, modelSettings)
    .click(modelSettings.modelSubType)
    .clearValue('#nr-burn-in-input')
    .setValue('#nr-burn-in-input', 1000)
    .clearValue('#nr-inference-input')
    .setValue('#nr-inference-input', 2000)
    .clearValue('#nr-thinning-factor-input')
    .setValue('#nr-thinning-factor-input', 2)
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', constants.MODEL_WAIT_TIME_OUT);
}

function addModelWithLeaveOneOut(browser, modelSettings) {
  return beforeEach(browser, modelSettings)
    .click('#leave-one-out-checkbox')
    .click('#leave-one-out-specific-type-radio')
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', constants.MODEL_WAIT_TIME_OUT);
}

function addDesignAdjustedModel(browser, modelSettings) {
  return beforeEach(browser, modelSettings)
    .click('#adjustment-checkbox')
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', constants.MODEL_WAIT_TIME_OUT);
}

function beforeEach(browser, modelSettings) {
  return browser
    .waitForElementVisible('#add-model-button')
    .click('#add-model-button')
    .setValue('#title-input', modelSettings.title)
    .click(modelSettings.effectsType)
    .click(modelSettings.modelMainType);
}

function verifyCommonContent(browser, modelTitle = constants.MODEL_TITLE, analysisTitle = constants.ANALYSIS_TITLE, outcome = constants.OUTCOME, modelType = 'network', modelEffectsType = 'random') {
  return browser
    .assert.containsText('#model-label', modelTitle)
    .assert.containsText('#model-view-analysis', analysisTitle)
    .assert.containsText('#model-view-outcome', outcome)
    .assert.containsText('#model-type', modelType)
    .assert.containsText('#model-effects-type', modelEffectsType)
    .waitForElementVisible('#residual-deviance-plot')
    .waitForElementVisible('#model-fit-table')
    .waitForElementVisible('#rank-probabilities');
}

function verifyNetworkModelContents(browser, modelTitle = constants.MODEL_TITLE, analysisTitle = constants.ANALYSIS_TITLE, outcome = constants.OUTCOME) {
  return verifyCommonContent(browser, modelTitle, analysisTitle, outcome)
    .waitForElementVisible('#convergence-diagnostics-table')
    .waitForElementVisible('#random-effects-standard-deviation')
    .waitForElementVisible('#absolute-treatment-effects')
    .waitForElementVisible('#study-effect-funnel-plot')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#relative-effects-plots')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#rank-probabilities-table')
    .waitForElementVisible('#absolute-residual-deviance-table');
}
