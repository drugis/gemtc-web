var login = require('./util/login');
var AnalysesPage = require('./analyses/analysesPage');

var analysisTitle = 'my title';
var analysisOutcomeTitle = 'my outcome';

module.exports = {
  "add json test": function(browser) {
    var analysesPage = new AnalysesPage(browser);
    login(browser, 'http://localhost:3001');

    analysesPage.waitForPageToLoad();
    analysesPage.addAnalysis(analysisTitle, analysisOutcomeTitle, '/example.json');
    browser
      .waitForElementVisible('#analysis-header', 10000)
      .assert.containsText('#analysisTitle', analysisTitle)
      .assert.containsText('#analysisOutcome', analysisOutcomeTitle);
    analysesPage.end();
  }
};
