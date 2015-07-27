var login = require('./util/login');
var AnalysesPage = require('./analyses/analysesPage');
var AnalysisOverviewPage = require('./analyses/analysisOverviewPage');

var analysisTitle = 'my title';
var analysisOutcomeTitle = 'my outcome';

module.exports = {
  "gemtc login test": function(browser) {
    var analysesPage = new AnalysesPage(browser);
    var analysisOverviewPage = new AnalysisOverviewPage(browser);
    
    login(browser, 'http://localhost:3001');

    analysesPage.waitForPageToLoad();
    analysesPage.addAnalysis(analysisTitle, analysisOutcomeTitle, '/example.json');
    browser.waitForElementVisible('#analysis-header', 10000);

    analysisOverviewPage.waitForPageToLoad();
    analysisOverviewPage.addModel();
    browser.waitForElementVisible('#create-model-header', 50000);
    analysisOverviewPage.end();
  }
};
