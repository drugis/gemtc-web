'use strict';

const loginService = require('./util/loginService.js');

module.exports = {
  'Login success': function(browser) {
    loginService.login(browser)
      .waitForElementVisible('#analyses-header')
      .assert.containsText('#analyses-header', 'Analyses')
      .end();
  },

  'Login fail': function(browser) {
    loginService.login(browser, 'wrong name', 'wrong password')
      .waitForElementVisible('#loginWarning')
      .end();
  }
};
