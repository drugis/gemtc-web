'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

const TITLE = 'my title';
const OUTCOME = 'my outcome';
const MODEL_TITLE = 'model title';

const networkModelSettings = {
  title: MODEL_TITLE,
  effectsType: '#random-effect-radio',
  modelMainType: '#network-model-type-radio',
  modelSubType: '#network-model-type-radio'
};

function verifyPairwiseModelContents(browser, modelIndex) {
  browser
    .click('#model-' + modelIndex)
    .waitForElementVisible('#model-settings-section', 10000)
    .assert.containsText('#model-label', MODEL_TITLE)
    .assert.containsText('#model-view-analysis', 'my title')
    .assert.containsText('#model-view-outcome', 'my outcome')
    .assert.containsText('#model-type', 'pairwise')
    .assert.containsText('#model-pairwise-comparison', 'Fluoxetine — ')
    .assert.containsText('#model-effects-type', 'fixed')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#study-effect-forest-plot')
    .waitForElementVisible('#study-effect-funnel-plot')
    .waitForElementVisible('#funnel-plot-requires-more-studies-warning')
    .waitForElementVisible('#rank-probabilities')
    .waitForElementVisible('#rank-probabilities-table')
    .waitForElementVisible('#rank-probabilities-treatment-0')
    .waitForElementVisible('#rank-probabilities-treatment-1')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#model-fit-table')
    .waitForElementVisible('#residual-deviance-plot')
    .waitForElementVisible('#absolute-residual-deviance-table')
    .click('#logo')
    .click('#analysis-title-0');
  return browser;
}

function verifyNetworkModelContents(browser) {
  browser
    .waitForElementVisible('#model-settings-section', 10000)
    .assert.containsText('#model-label', MODEL_TITLE)
    .assert.containsText('#model-view-analysis', TITLE)
    .assert.containsText('#model-view-outcome', OUTCOME)
    .assert.containsText('#model-type', 'network')
    .assert.containsText('#model-effects-type', 'random')
    .waitForElementVisible('#convergence-diagnostics-table')
    .waitForElementVisible('#random-effects-standard-deviation')
    .waitForElementVisible('#absolute-treatment-effects')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#relative-effects-plots')
    .waitForElementVisible('#study-effect-funnel-plot')
    .waitForElementVisible('#rank-probabilities')
    .waitForElementVisible('#rank-probabilities-table')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#model-fit-table')
    .waitForElementVisible('#residual-deviance-plot')
    .waitForElementVisible('#absolute-residual-deviance-table');
  return browser;
}

module.exports = {
  beforeEach: function(browser) {
    browser.resizeWindow(1366, 728);
    loginService.login(browser)
      .waitForElementVisible('#analyses-header');
  },

  afterEach: function(browser) {
    analysesService.deleteFromList(browser).end();
  },

  'Create fixed effect pairwise specific pair model': function(browser) {
    const modelSettings = {
      title: MODEL_TITLE,
      effectsType: '#fixed-effect-radio',
      modelMainType: '#pairwise-model-main-type-radio',
      modelSubType: '#pairwise-specific-type-radio'
    };
    const modelType = 'pairwise';
    const pairwiseComparison = 'Fluoxetine — Paroxetine';
    const effectsType = 'fixed';

    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
    modelService.addModel(browser, modelSettings)
      .waitForElementVisible('#model-settings-section', 10000)
      .assert.containsText('#model-label', MODEL_TITLE)
      .assert.containsText('#model-view-analysis', TITLE)
      .assert.containsText('#model-view-outcome', OUTCOME + ' ( higher is better , log scale )')
      .assert.containsText('#model-type', modelType)
      .assert.containsText('#model-pairwise-comparison', pairwiseComparison)
      .assert.containsText('#model-effects-type', effectsType)
      .assert.containsText('#diagnostic-label-0', 'd.2.3 (Fluoxetine, Paroxetine)')
      .waitForElementVisible('#relative-effects-table')
      .waitForElementVisible('#study-effect-forest-plot')
      .waitForElementVisible('#study-effect-funnel-plot')
      .waitForElementVisible('#funnel-plot-requires-more-studies-warning')
      .waitForElementVisible('#rank-probabilities')
      .waitForElementVisible('#rank-probabilities-table')
      .assert.containsText('#rank-probabilities-treatment-0', 'Fluoxetine')
      .assert.containsText('#rank-probabilities-treatment-1', 'Paroxetine')
      .waitForElementVisible('#rank-probabilities-plot')
      .waitForElementVisible('#model-fit-table')
      .waitForElementVisible('#residual-deviance-plot')
      .waitForElementVisible('#absolute-residual-deviance-table');
  },

  'Create fixed effect pairwise model': function(browser) {
    const modelSettings = {
      title: MODEL_TITLE,
      effectsType: '#fixed-effect-radio',
      modelMainType: '#pairwise-model-main-type-radio',
      modelSubType: '#all-pairwise-model-type-radio'
    };

    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
    modelService.addModel(browser, modelSettings)
      .waitForElementVisible('#model-0')
      .waitForElementVisible('#model-1');
    verifyPairwiseModelContents(browser, 0);
    verifyPairwiseModelContents(browser, 1);
  },

  'Create new network model using relative data': function(browser) {
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/parkinson-shared.csv');
    modelService.addModel(browser, networkModelSettings);
    verifyNetworkModelContents(browser)
      .waitForElementVisible('#contrast-residual-deviance-table');
  },

  'Create new network model': function(browser) {
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
    modelService.addModel(browser, networkModelSettings);
    verifyNetworkModelContents(browser);
  },

  'Create new nodesplit specific model': function(browser) {
    const modelSettings = {
      title: MODEL_TITLE,
      effectsType: '#random-effect-radio',
      modelMainType: '#node-split-model-main-type-radio',
      modelSubType: '#node-split-specific-type-radio'
    };
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
    modelService.addModel(browser, modelSettings)
      .waitForElementVisible('#model-settings-section', 10000)
      .assert.containsText('#model-label', MODEL_TITLE)
      .assert.containsText('#model-view-analysis', TITLE)
      .assert.containsText('#model-view-outcome', OUTCOME)
      .assert.containsText('#model-type', 'node-split')
      .assert.containsText('#model-node-split', 'Fluoxetine — Paroxetine')
      .assert.containsText('#model-effects-type', 'random')
      .waitForElementVisible('#convergence-diagnostics-table')
      .waitForElementVisible('#random-effects-standard-deviation')
      .waitForElementVisible('#node-split-results-table')
      .waitForElementVisible('#density-plot')
      .waitForElementVisible('#model-fit-table')
      .waitForElementVisible('#residual-deviance-plot')
      .waitForElementVisible('#absolute-residual-deviance-table');
  },

  'Create model with non-default prior': function(browser) {
    analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
    modelService.addModelWithPrior(browser, networkModelSettings);
    verifyNetworkModelContents(browser);
  }
};
