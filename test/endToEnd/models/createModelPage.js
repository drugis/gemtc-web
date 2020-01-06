'use strict';
function CreateModelPage(browser) {
  this.browser = browser;
}

CreateModelPage.prototype = {
  waitForPageToLoad: function() {
    this.browser.waitForElementVisible('#create-model-header', 50000);
  },
  end: function() {
    this.browser.end();
  },
  setTitle: function(title) {
    this.browser.setValue('#title-input', title);
  },
  setEffectsType: function(type) {
    if (type === 'random') {
      this.browser.click('#random-effect-radio').pause(300);
    } else if (type === 'fixed') {
      this.browser.click('#fixed-effect-radio').pause(300);
    }
  },
  setModelMainType: function(type) {
    if (type === 'network') {
      this.browser.click('#network-model-type-radio').pause(300);
    } else if (type === 'pairwise') {
      this.browser.click('#pairwise-model-main-type-radio').pause(300);
    } else if (type === 'node-split') {
      this.browser.click('#node-split-model-main-type-radio').pause(300);
    } else if (type === 'regression') {
      this.browser.click('#meta-regression-model-type-radio').pause(300);
    }
  },
  setModelSubType: function(subType) {
    if (subType === 'pairwise-all') {
      this.browser.waitForElementVisible('#all-pairwise-model-type-radio', 50000);
      this.browser.click('#all-pairwise-model-type-radio').pause(300);
    } else if (subType === 'pairwise-specific') {
      this.browser.waitForElementVisible('#pairwise-specific-type-radio', 50000);
      this.browser
        .click('#pairwise-specific-type-radio').pause(300)
        .click('#comparison-select').pause(300)
        .keys(['\uE015', '\uE004']).pause(300); //down then tab
    } else if (subType === 'node-split-all') {
      this.browser.waitForElementVisible('#all-node-split-model-type-radio', 50000);
      this.browser.click('#all-node-split-model-type-radio').pause(300);
    } else if (subType === 'node-split-specific') {
      this.browser.waitForElementVisible('#node-split-specific-type-radio', 50000);
      this.browser
        .click('#node-split-specific-type-radio')
        .pause(300)
        .click('#node-split-select').pause(300)
        .keys(['\uE015', '\uE004']).pause(300); //down then tab
    }
  },
  setLikelihoodAndLink: function() {
    this.browser
      .click('#likelihood-link-select')
      .keys(['\uE015', '\uE004']); //down then tab
  },
  setCovariate: function() {
    this.browser
      .click('#covariate-select')
      .keys(['\uE015', '\uE004']); //down then tab
  },
  setHeterogeneity: function(type, settings) {
    if (type === 'automatic') {
      this.browser.click('#heterogeneity-prior-automatic-radio').pause(300);
    } else if (type === 'uniform') {
      this.browser.click('#heterogeneity-prior-standard-deviation-radio')
        .clearValue('#heterogeneity-uniform-parameter1-input')
        .setValue('#heterogeneity-uniform-parameter1-input', settings.lower)
        .clearValue('#heterogeneity-uniform-parameter2-input')
        .setValue('#heterogeneity-uniform-parameter2-input', settings.upper)
        .pause(300);
    } else if (type === 'log-n') {
      this.browser.click('#heterogeneity-prior-variance-radio')
        .clearValue('#heterogeneity-uniform-parameter1-input')
        .setValue('#heterogeneity-log-n-parameter1-input', settings.mean)
        .clearValue('#heterogeneity-uniform-parameter2-input')
        .setValue('#heterogeneity-log-n-parameter2-input', settings.std)
        .pause(300);
    } else if (type === 'gamma') {
      this.browser.click('#heterogeneity-prior-precision-radio')
        .clearValue('#heterogeneity-uniform-parameter1-input')
        .setValue('#heterogeneity-gamma-parameter1-input', settings.rate)
        .clearValue('#heterogeneity-uniform-parameter2-input')
        .setValue('#heterogeneity-gamma-parameter2-input', settings.shape)
        .pause(300);
    }
  },
  setRunLength: function(burnInIterations, inferenceIterations, thinningFactor) {
    this.browser
      .clearValue('#nr-burn-in-input')
      .setValue('#nr-burn-in-input', burnInIterations)
      .clearValue('#nr-inference-input')
      .setValue('#nr-inference-input', inferenceIterations)
      .clearValue('#nr-thinning-factor-input')
      .setValue('#nr-thinning-factor-input', thinningFactor);
    console.log('set run length completed');
  },
  createModel: function() {
    console.log('do create model');
    this.browser.click('#submit-add-model-btn');
  }
};

module.exports = CreateModelPage;
