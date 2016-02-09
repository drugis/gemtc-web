'use strict';
var testUrl = process.env.GEMTC_NIGHTWATCH_URL ? process.env.GEMTC_NIGHTWATCH_URL : 'https://gemtc-test.drugis.org';
var login = require('./util/login.js');

module.exports = {
  "gemtc login test" : function (browser) {
    login(browser, testUrl)
      .waitForElementVisible('#analyses-header', 15000)
      .assert.containsText('#analyses-header', 'Analyses')
      .end();
  }
};
