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
      this.browser.click('#random-effect-radio');
    } else if (type == 'fixed') {
      this.browser.click('#fixed-effect-radio');
    }
  },
  setModelMainType: function(type) {
    if (type === 'network') {
      this.browser.click('#network-model-type-radio')
    } else if (type === 'pairwise') {
      this.browser.click('#pairwise-model-main-type-radio')
    } else if (type === 'node-split') {
      this.browser.click('#node-split-model-main-type-radio')
    }
  },
  setModelSubType: function(subType) {
    if (subType === 'pairwise-all') {
      this.browser.click('#all-pairwise-model-type-radio');
    } else if (subType === 'pairwise-specific') {
      this.browser
        .click('#pairwise-specific-type-radio')
        .click('#comparison-select')
        .keys(['\uE015', '\uE004']); //down then tab
    } else if (subType === 'node-split-all') {
      this.browser.click('#all-node-split-model-type-radio');
    } else if (subType === 'node-split-specific') {
      this.browser
        .click('#node-split-specific-type-radio')
        .pause(300)
        .click('#node-split-select')
        .keys(['\uE015', '\uE004']); //down then tab
    }
  },
  setLikelihoodAndLink: function() {
      this.browser
        .click('#likelihood-link-select')
        .keys(['\uE015', '\uE004']); //down then tab
  },
  setRunLength: function(burnInIterations, inferenceIterations, thinningFactor) {
    this.browser
      .clearValue('#burn-in-iterations')
      .setValue('#burn-in-iterations', burnInIterations)
      .clearValue('#inference-iterations')
      .setValue('#inference-iterations', inferenceIterations)
      .clearValue('#thinning-factor')
      .setValue('#thinning-factor', thinningFactor);
    console.log('set run length completed');
  },
  createModel: function() {
    console.log('do create model');
    this.browser.click('#submit-add-model-btn');
  }
};

module.exports = CreateModelPage;