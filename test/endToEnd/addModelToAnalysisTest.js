'use strict';

const loginService = require('./util/loginService');
const analysesService = require('./analyses/analysesService');
const modelService = require('./models/modelService.js');

const TITLE = 'my title';
const OUTCOME = 'my outcome';
const MODEL_TITLE = 'model title';
const FIXED_EFFECT_MODEL = '#fixed-effect-radio';
const RANDOM_EFFECT_MODEL = '#random-effect-radio';

const networkModelSettings = {
  title: MODEL_TITLE,
  effectsType: RANDOM_EFFECT_MODEL,
  modelMainType: '#network-model-type-radio',
  modelSubType: '#network-model-type-radio'
};

function verifyPairwiseModelContents(browser, modelIndex) {
  browser.click('#model-' + modelIndex);
  verifyCommonContent(browser, 'pairwise', 'fixed')
    .assert.containsText('#model-pairwise-comparison', 'Fluoxetine — ')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#study-effect-forest-plot')
    .waitForElementVisible('#study-effect-funnel-plot')
    .waitForElementVisible('#funnel-plot-requires-more-studies-warning')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#rank-probabilities-table')
    .waitForElementVisible('#rank-probabilities-treatment-0')
    .waitForElementVisible('#rank-probabilities-treatment-1')
    .waitForElementVisible('#absolute-residual-deviance-table')
    .click('#logo')
    .click('#analysis-title-0');
  return browser;
}

function verifyNetworkModelContents(browser) {
  verifyCommonContent(browser)
    .waitForElementVisible('#convergence-diagnostics-table')
    .waitForElementVisible('#random-effects-standard-deviation')
    .waitForElementVisible('#absolute-treatment-effects')
    .waitForElementVisible('#study-effect-funnel-plot')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#relative-effects-plots')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#rank-probabilities-table')
    .waitForElementVisible('#absolute-residual-deviance-table');
  return browser;
}

function verifyMetaRegressionModelContents(browser) {
  verifyCommonContent(browser, 'regression')
    .waitForElementVisible('#convergence-diagnostics-table')
    .waitForElementVisible('#covariate-effect-plot')
    .waitForElementVisible('#meta-regression-table')
    .waitForElementVisible('#random-effects-standard-deviation')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#relative-effects-plots')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#rank-probabilities-table')
    .waitForElementVisible('#contrast-residual-deviance-table');
  return browser;
}

function verifyFixedConsistencyModelContents(browser) {
  verifyCommonContent(browser, 'network', 'fixed')
    .assert.containsText('#model-likelihood', 'binom / logit')
    .waitForElementVisible('#convergence-diagnostics-table')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#relative-effects-plots')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#rank-probabilities-table')
    .waitForElementVisible('#absolute-residual-deviance-table')
    .click('#logo');
  return browser;
}

function verifyLeaveOneOutModelContents(browser) {
  verifyCommonContent(browser)
    .assert.containsText('#model-sub-type', 'leave one out')
    .waitForElementVisible('#convergence-diagnostics-table')
    .waitForElementVisible('#random-effects-standard-deviation')
    .waitForElementVisible('#absolute-treatment-effects')
    .waitForElementVisible('#study-effect-funnel-plot')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#relative-effects-plots')
    .waitForElementVisible('#absolute-residual-deviance-table');
  return browser;
}

function verifyDesignAdjustedModelContents(browser) {
  verifyCommonContent(browser)
    .assert.containsText('#model-likelihood', 'normal / identity')
    .waitForElementVisible('#convergence-diagnostics-table')
    .waitForElementVisible('#random-effects-standard-deviation')
    .waitForElementVisible('#absolute-treatment-effects')
    .waitForElementVisible('#study-effect-funnel-plot')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#relative-effects-plots')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#rank-probabilities-table')
    .waitForElementVisible('#absolute-residual-deviance-table');
  return browser;
}

function verifyCommonContent(browser, modelType = 'network', modelEffectsType = 'random') {
  browser
    .assert.containsText('#model-label', MODEL_TITLE)
    .assert.containsText('#model-view-analysis', TITLE)
    .assert.containsText('#model-view-outcome', OUTCOME)
    .assert.containsText('#model-type', modelType)
    .assert.containsText('#model-effects-type', modelEffectsType)
    .waitForElementVisible('#residual-deviance-plot')
    .waitForElementVisible('#model-fit-table')
    .waitForElementVisible('#rank-probabilities')
    ;
  return browser;
}

function beforeEach(browser) {
  browser.resizeWindow(1366, 728);
  loginService.login(browser)
    .waitForElementVisible('#analyses-header');
}

function afterEach(browser) {
  analysesService.deleteFromList(browser).end();
}

function fixedEffectSpecificPairwiseModel(browser) {
  const modelSettings = {
    title: MODEL_TITLE,
    effectsType: FIXED_EFFECT_MODEL,
    modelMainType: '#pairwise-model-main-type-radio',
    modelSubType: '#pairwise-specific-type-radio'
  };
  const pairwiseComparison = 'Fluoxetine — Paroxetine';

  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModel(browser, modelSettings);
  verifyCommonContent(browser, 'pairwise', 'fixed')
    .assert.containsText('#model-pairwise-comparison', pairwiseComparison)
    .assert.containsText('#diagnostic-label-0', 'd.2.3 (Fluoxetine, Paroxetine)')
    .waitForElementVisible('#relative-effects-table')
    .waitForElementVisible('#study-effect-forest-plot')
    .waitForElementVisible('#study-effect-funnel-plot')
    .waitForElementVisible('#funnel-plot-requires-more-studies-warning')
    .waitForElementVisible('#rank-probabilities-table')
    .assert.containsText('#rank-probabilities-treatment-0', 'Fluoxetine')
    .assert.containsText('#rank-probabilities-treatment-1', 'Paroxetine')
    .waitForElementVisible('#rank-probabilities-plot')
    .waitForElementVisible('#absolute-residual-deviance-table');
}

function fixedEffectPairwiseModel(browser) {
  const modelSettings = {
    title: MODEL_TITLE,
    effectsType: FIXED_EFFECT_MODEL,
    modelMainType: '#pairwise-model-main-type-radio',
    modelSubType: '#all-pairwise-model-type-radio'
  };

  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModel(browser, modelSettings)
    .waitForElementVisible('#model-title-0')
    .waitForElementVisible('#model-title-1');
  verifyPairwiseModelContents(browser, 0);
  verifyPairwiseModelContents(browser, 1);
}

function relativeNetworkModel(browser) {
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/parkinson-shared.csv');
  modelService.addModel(browser, networkModelSettings);
  verifyNetworkModelContents(browser)
    .waitForElementVisible('#contrast-residual-deviance-table');
}

function netWorkModel(browser) {
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModel(browser, networkModelSettings);
  verifyNetworkModelContents(browser);
}

function nodesplitSpecificModel(browser) {
  const modelSettings = {
    title: MODEL_TITLE,
    effectsType: RANDOM_EFFECT_MODEL,
    modelMainType: '#node-split-model-main-type-radio',
    modelSubType: '#node-split-specific-type-radio'
  };
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModel(browser, modelSettings)
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
}

function metaRegressionModel(browser) {
  const modelSettings = {
    title: MODEL_TITLE,
    effectsType: RANDOM_EFFECT_MODEL,
    modelMainType: '#meta-regression-model-type-radio',
    modelSubType: '#meta-regression-model-type-radio'
  };
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/parkinson-rel.csv');
  modelService.addModel(browser, modelSettings);
  verifyMetaRegressionModelContents(browser);
}

function fixedConsistencyModel(browser) {
  const modelSettings = {
    title: MODEL_TITLE,
    effectsType: FIXED_EFFECT_MODEL,
    modelMainType: '#network-model-type-radio',
    modelSubType: '#network-model-type-radio'
  };
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModel(browser, modelSettings);
  verifyFixedConsistencyModelContents(browser);
}

function leaveSpecificStudyOutConsistencyModel(browser) {
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModelWithLeaveOneOut(browser, networkModelSettings);

  verifyLeaveOneOutModelContents(browser);
}

function designAdjustedConsistencyModel(browser) {
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example-with-covariate.json');
  modelService.addDesignAdjustedModel(browser, networkModelSettings);
  verifyDesignAdjustedModelContents(browser);
}

function nonDefaultPriorModel(browser) {
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModelWithPrior(browser, networkModelSettings);
  verifyNetworkModelContents(browser);
}

function nonDefaultRunLengthModel(browser) {
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModelWithRunLengthParameters(browser, networkModelSettings);
  browser
    .assert.containsText('#burn-in-iterations', 1000)
    .assert.containsText('#inference-iterations', 2000)
    .assert.containsText('#thinning-factor', 2);
}

function extendRunLenthModel(browser) {
  const refinedModelTitle = 'refined model';
  analysesService.addAnalysis(browser, TITLE, OUTCOME, '/example.json');
  modelService.addModelWithRunLengthParameters(browser, networkModelSettings);
  browser
    .click('#refine-model-button')
    .setValue('#title-input', refinedModelTitle)
    .clearValue('#nr-burn-in-input')
    .setValue('#nr-burn-in-input', 1000)
    .clearValue('#nr-inference-input')
    .setValue('#nr-inference-input', 2000)
    .clearValue('#nr-thinning-factor-input')
    .setValue('#nr-thinning-factor-input', 2)
    .click('#submit-add-model-button')
    .waitForElementVisible('#model-settings-section', 10000)
    .assert.containsText('#model-label', refinedModelTitle)
    .assert.containsText('#burn-in-iterations', 1000)
    .assert.containsText('#inference-iterations', 2000)
    .assert.containsText('#thinning-factor', 2)
    ;
}

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Create fixed effect pairwise specific pair model': fixedEffectSpecificPairwiseModel,
  'Create fixed effect pairwise model': fixedEffectPairwiseModel,
  'Create new network model using relative data': relativeNetworkModel,
  'Create new network model': netWorkModel,
  'Create new nodesplit specific model': nodesplitSpecificModel,
  'Create new meta regression model': metaRegressionModel,
  'Create new fixed consistency model': fixedConsistencyModel,
  'Create consistency model leaving one specific study out': leaveSpecificStudyOutConsistencyModel,
  'Create design adjusted consistency model': designAdjustedConsistencyModel,
  'Create model with non-default prior': nonDefaultPriorModel,
  'Create model with non-default run length parameters': nonDefaultRunLengthModel,
  'Extend run length of an existing model': extendRunLenthModel
};
