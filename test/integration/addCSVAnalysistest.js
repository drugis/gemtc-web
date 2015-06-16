var login = require('./util/login');
var AnalysesPage = require('./analyses/analysesPage');

var analysisTitle = 'my title';

module.exports = {
  "gemtc login test": function(browser) {
    var analysesPage = new AnalysesPage(browser);
    login(browser, 'http://localhost:3001');

    analysesPage.waitForPageToLoad();
    analysesPage.addAnalysis(analysisTitle, 'my outcome', '/example.csv');
    browser
      .waitForElementVisible('#analysis-header', 10000)
      .assert.containsText('dd', analysisTitle);
    analysesPage.end();
  }
};
