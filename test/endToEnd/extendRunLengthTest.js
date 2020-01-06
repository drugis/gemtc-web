'use strict';

var loginService = require('./util/loginService');
var AnalysesPage = require('./analyses/analysesPage');
var AnalysisOverviewPage = require('./analyses/analysisOverviewPage');
var CreateModelPage = require('./models/createModelPage');
var ModelResultPage = require('./models/modelResultPage');

var analysisTitle = 'my title';
var analysisOutcomeTitle = 'my outcome';

module.exports = {
  'Extend the runlength of a model': function(browser) {
    var analysesPage = new AnalysesPage(browser);
    var analysisOverviewPage = new AnalysisOverviewPage(browser);
    var createModelPage = new CreateModelPage(browser);
    var modelResultPage = new ModelResultPage(browser);
    var burnInIterations = 100;
    var inferenceIterations = 52;
    var thinningFactor = 1;
    
    loginService.login(browser);
    analysesPage.waitForPageToLoad();
    analysesPage.addAnalysis(analysisTitle, analysisOutcomeTitle, '/example.json');
    browser.waitForElementVisible('#analysis-header', 10000);
    analysisOverviewPage.waitForPageToLoad();
    analysisOverviewPage.addModel();
    createModelPage.waitForPageToLoad();
    createModelPage.setTitle('Nightwatch model');
    createModelPage.setEffectsType('random');
    createModelPage.setModelMainType('network');
    createModelPage.setLikelihoodAndLink();
    createModelPage.setRunLength(burnInIterations, inferenceIterations, thinningFactor);
    browser.pause(300);
    createModelPage.createModel();
    modelResultPage.waitForPageToLoad();
    modelResultPage.waitForResults();

    modelResultPage.extendRunLength();

    browser.pause(300);
    modelResultPage.waitForPageToLoad();
    modelResultPage.waitForResults();
    browser.pause(300);
    modelResultPage.end();
  }
};
