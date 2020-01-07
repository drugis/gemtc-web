'use strict';

var loginService = require('./util/loginService');
var AnalysesPage = require('./analyses/analysesPage');

module.exports = {
  'Ask for inline help': function(browser) {
    var analysesPage = new AnalysesPage(browser);
    loginService.login(browser);

    analysesPage.waitForPageToLoad();
    browser
      .assert.visible('inline-help')
      .assert.elementNotPresent('.joyride-tip-guide')
      .click('inline-help a')
      .assert.visible('.joyride-tip-guide');

    analysesPage.end();
  }
};
