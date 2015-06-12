var login = require('./util/login.js');

// test the login

module.exports = {
  "gemtc login test" : function (browser) {
    login(browser, 'http://localhost:3001')
      .waitForElementVisible('body', 15000)
      .waitForElementVisible('#analyses-header', 15000)
      .assert.containsText('#analyses-header', 'Analyses')
      .waitForElementVisible('#add-analysis-btn', 15000)
      .click('#add-analysis-btn')
      .waitForElementVisible('#add-analysis-form', 15000)
      .setValue('#title-input', 'my analysis title')
      .pause(1000)
      .setValue('#outcome-input', 'my analysis outcome')
      .pause(1000)
      .click('#add-analysis-form button')
      .setValue('#problem-file-upload', require('path').resolve(__dirname + '/example.json')) // Works
      .pause(1000)
      .assert.elementPresent('#submit-add-analysis-btn')
      .click('#submit-add-analysis-btn')
       .waitForElementVisible('#analysis-header', 15000)
      .assert.containsText('#analysis-header', 'Analysis')
      .pause(1000)
      .end();
  }
};
