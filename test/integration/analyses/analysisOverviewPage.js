function AnalysisOverviewPage(browser) {
  this.browser = browser;
}

AnalysisOverviewPage.prototype = {
  waitForPageToLoad: function() {
    this.browser.waitForElementVisible('#analysis-header', 50000);
  },
  end: function() {
    this.browser.end();
  },
  addModel: function() {
    this.browser
      .click('#add-model-btn')
  }
};

module.exports = AnalysisOverviewPage;
