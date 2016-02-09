'use strict';

var testUrl = process.env.GEMTC_NIGHTWATCH_URL ? process.env.GEMTC_NIGHTWATCH_URL : 'https://gemtc-test.drugis.org';

module.exports = {
  'Gemtc attract mode' : function (browser) {
    browser
      .url(testUrl)
      .waitForElementVisible('body', 1000)
      .pause(1000)
      .assert.containsText('h1', 'gemtc.drugis.org')
      .end();
  }
};
