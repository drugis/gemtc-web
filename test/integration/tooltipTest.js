var login = require('./util/login');
var AnalysesPage = require('./analyses/analysesPage');

var analysisTitle = 'my title';
var analysisOutcomeTitle = 'my outcome';

module.exports = {
  "ask for inline help": function(browser) {
    var analysesPage = new AnalysesPage(browser);
    login(browser, process.env.GEMTC_NIGHTWATCH_URL);

    analysesPage.waitForPageToLoad();
    browser
      .assert.visible("inline-help")
      .assert.elementNotPresent(".joyride-tip-guide")
      .click('inline-help')
      .pause(500)
      .assert.visible(".joyride-tip-guide");

    analysesPage.end();
  }
};
