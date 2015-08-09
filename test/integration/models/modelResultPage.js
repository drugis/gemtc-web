function ModelResultPage(browser) {
  this.browser = browser;
}

ModelResultPage.prototype = {
  waitForPageToLoad: function() {
    this.browser.waitForElementVisible('#model-results-header', 50000);
  },
  end: function() {
    this.browser.end();
  },
  waitForResults: function() {
    this.browser.waitForElementVisible('#model-results-results-header', 80000);
  },
};

module.exports = ModelResultPage;