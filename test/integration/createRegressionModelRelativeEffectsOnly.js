var login = require('./util/login');
var AnalysesPage = require('./analyses/analysesPage');
var AnalysisOverviewPage = require('./analyses/analysisOverviewPage');
var CreateModelPage = require('./models/createModelPage');
var ModelResultPage = require('./models/modelResultPage');
var assert = require('assert');

var analysisTitle = 'my title';
var analysisOutcomeTitle = 'my outcome';

module.exports = {
  "create new network model and set run-length parameters": function(browser) {
    var analysesPage = new AnalysesPage(browser);
    var analysisOverviewPage = new AnalysisOverviewPage(browser);
    var createModelPage = new CreateModelPage(browser);
    var modelResultPage = new ModelResultPage(browser);
    var burnInIterations = 100;
    var inferenceIterations = 52;
    var thinningFactor = 1;

    login(browser, process.env.GEMTC_NIGHTWATCH_URL);

    analysesPage.waitForPageToLoad();
    analysesPage.addAnalysis(analysisTitle, analysisOutcomeTitle, '/parkinson-rel.csv');
    browser.waitForElementVisible('#analysis-header', 10000);

    analysisOverviewPage.waitForPageToLoad();
    analysisOverviewPage.addModel();

    createModelPage.waitForPageToLoad();
    createModelPage.setTitle('Nightwatch model');
    createModelPage.setEffectsType('random');
    createModelPage.setModelMainType('regression');
    createModelPage.setRunLength(burnInIterations, inferenceIterations, thinningFactor);
    browser.pause(300);
    createModelPage.createModel();

    modelResultPage.waitForPageToLoad();
    modelResultPage.waitForResults();

    browser.pause(300);
    modelResultPage.end();
  }
};
