'use strict';

const loginService = require('./util/loginService.js');

function loginSucces(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header')
    .assert.containsText('#analyses-header', 'Analyses')
    .end();
}

function loginFail(browser) {
  browser
    .url(loginService.TEST_URL)
    .waitForElementVisible('#signinButton', 5000)
    .setValue('#username', 'wrong username')
    .setValue('#password', ' wrong password')
    .click('#signinButton')
    .waitForElementVisible('#loginWarning')
    .end();
}

module.exports = {
  'Login success': loginSucces,
  'Login fail': loginFail
};
