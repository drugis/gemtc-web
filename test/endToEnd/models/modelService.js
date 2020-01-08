'use strict';

function addDefaultModel(browser, modelTitle = 'title') {
  return browser
  .waitForElementVisible('#add-model-button')
  .click('#add-model-button')
  .setValue('#title-input', modelTitle)
  .click('#submit-add-model-button')
  .waitForElementVisible('#model-settings-section', 10000);
}

function addModel(browser, modelSettings) {
  return beforeEach(browser, modelSettings)
    .click(modelSettings.modelSubType)
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', 10000);
}

function addModelWithPrior(browser, modelSettings) {
  return beforeEach(browser, modelSettings)
    .click(modelSettings.modelSubType)
    .click('#heterogeneity-prior-variance-radio')
    .setValue('#heterogeneity-log-n-parameter1-input', 3)
    .setValue('#heterogeneity-log-n-parameter2-input', 0.2)
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', 10000);
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
    .waitForElementVisible('#model-settings-section', 10000);
}

function addModelWithLeaveOneOut(browser, modelSettings) {
  return beforeEach(browser, modelSettings)
    .click('#leave-one-out-checkbox')
    .click('#leave-one-out-specific-type-radio')
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', 10000);
}

function addDesignAdjustedModel(browser, modelSettings) {
  return beforeEach(browser, modelSettings)
    .click('#adjustment-checkbox')
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', 10000);
}

function beforeEach(browser, modelSettings) {
  return browser
    .waitForElementVisible('#add-model-button')
    .click('#add-model-button')
    .setValue('#title-input', modelSettings.title)
    .click(modelSettings.effectsType)
    .click(modelSettings.modelMainType);
}

module.exports = {
  addDefaultModel: addDefaultModel,
  addModel: addModel,
  addModelWithPrior: addModelWithPrior,
  addModelWithRunLengthParameters: addModelWithRunLengthParameters,
  addModelWithLeaveOneOut: addModelWithLeaveOneOut,
  addDesignAdjustedModel: addDesignAdjustedModel
};
