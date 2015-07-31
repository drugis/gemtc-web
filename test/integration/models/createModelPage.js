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
  	if(type == 'random') {
      this.browser.click('#random-effect-radio');
  	}else if(type == 'fixed') {
  	  this.browser.click('#fixed-effect-radio');
  	}
  },
  setModelType: function(type) {
  	if(type == 'node-split') {
      this.browser
        .click('#node-split-model-type-radio')
        .pause(300)
        .click('#node-split-select')
        .keys(['\uE015', '\uE004']); //down then tab
  	}
  	//todo impl more types
  },
  createModel: function() {
    this.browser
      .click('#submit-add-model-btn');
  }
};

module.exports = CreateModelPage;
