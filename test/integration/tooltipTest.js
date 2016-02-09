'use strict';
var testUrl = process.env.GEMTC_NIGHTWATCH_URL ? process.env.GEMTC_NIGHTWATCH_URL : 'https://gemtc-test.drugis.org';
var login = require('./util/login');
var AnalysesPage = require('./analyses/analysesPage');

var analysisTitle = 'my title';
var analysisOutcomeTitle = 'my outcome';

module.exports = {
  "ask for inline help": function(browser) {
    var analysesPage = new AnalysesPage(browser);
    login(browser, testUrl);

    analysesPage.waitForPageToLoad();
    browser
      .assert.visible("inline-help")
      .assert.elementNotPresent(".joyride-tip-guide")
      .click('inline-help a')
      .assert.visible(".joyride-tip-guide");

    analysesPage.end();
  }
};
