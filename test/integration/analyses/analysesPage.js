function AnalysesPage(browser) {
  this.browser = browser;
}

AnalysesPage.prototype = {
  waitForPageToLoad: function() {
    this.browser.waitForElementVisible('#analyses-header', 50000);
  },
  end: function() {
    this.browser.end();
  },
  addAnalysis: function(title, outcome, filename) {
    this.browser
      .click('#add-analysis-btn')
      .waitForElementVisible('h3', 10000)
      .setValue('#title-input', title)
      .setValue('#outcome-input', outcome)
      .click('#add-analysis-form button')
      .setValue('#problem-file-upload', require('path').resolve(__dirname + filename))
      .click('#submit-add-analysis-btn');
  }
};

module.exports = AnalysesPage;
