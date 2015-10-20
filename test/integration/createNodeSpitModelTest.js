var login = require('./util/login');
var AnalysesPage = require('./analyses/analysesPage');
var AnalysisOverviewPage = require('./analyses/analysisOverviewPage');
var CreateModelPage = require('./models/createModelPage');
var ModelResultPage = require('./models/modelResultPage');
var analysisTitle = 'my title';
var analysisOutcomeTitle = 'my outcome';

module.exports = {
  "create new nodesplit model": function(browser) {
    var analysesPage = new AnalysesPage(browser);
    var analysisOverviewPage = new AnalysisOverviewPage(browser);
    var createModelPage = new CreateModelPage(browser);
    var modelResultPage = new ModelResultPage(browser);

    login(browser, process.env.GEMTC_NIGHTWATCH_URL);

    analysesPage.waitForPageToLoad();
    analysesPage.addAnalysis(analysisTitle, analysisOutcomeTitle, '/example.json');
    browser.waitForElementVisible('#analysis-header', 10000);

    analysisOverviewPage.waitForPageToLoad();
    analysisOverviewPage.addModel();
    browser.waitForElementVisible('#create-model-header', 50000);

    createModelPage.setTitle('Nightwatch model');
    createModelPage.setEffectsType('random');
    createModelPage.setModelMainType('node-split');
    createModelPage.setModelSubType('node-split-specific');
    createModelPage.setLikelihoodAndLink();
    createModelPage.createModel();

    modelResultPage.waitForPageToLoad();
    modelResultPage.waitForResults();

    browser.pause(20000)
    createModelPage.end();
  }
};
