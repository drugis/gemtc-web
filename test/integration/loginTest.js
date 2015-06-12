var login = require('./util/login.js');

// test the login

module.exports = {
  "gemtc login test" : function (browser) {
    login(browser, 'http://localhost:3001')
      .waitForElementVisible('body', 15000)
      .waitForElementVisible('#analyses-header', 15000)
      .assert.containsText('#analyses-header', 'Analyses')
      .pause(5000)
      .end();
  }
};
