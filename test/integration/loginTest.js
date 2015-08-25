var login = require('./util/login.js');

// test the login

module.exports = {
  "gemtc login test" : function (browser) {
    login(browser, process.env.GEMTC_NIGHTWATCH_URL)
      .waitForElementVisible('#analyses-header', 15000)
      .assert.containsText('#analyses-header', 'Analyses')
      .end();
  }
};
