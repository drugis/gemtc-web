var login = require('./util/login.js');

// test the login

module.exports = {
  "gemtc login test" : function (browser) {
    login(browser, 'http://localhost:3000')
      .waitForElementVisible('body', 15000)
      .pause(5000)
      .source(function (result){
              // Source will be stored in result.value
              console.log(result.value);
          })
      .assert.containsText('h1', 'Analyses')
      .pause(5000)
      .end();
  }
};
