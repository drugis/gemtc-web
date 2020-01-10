'use strict';

module.exports = {
  'Login success': loginSucces,
  'Login fail': loginFail
};

const constants = require('./util/constants');
const loginService = require('./util/loginService');

function loginSucces(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header')
    .assert.containsText('#analyses-header', 'Analyses')
    .end();
}

function loginFail(browser) {
  browser
    .url(constants.TEST_URL)
    .waitForElementVisible('#signinButton', 5000)
    .setValue('#username', 'wrong username')
    .setValue('#password', ' wrong password')
    .click('#signinButton')
    .waitForElementVisible('#loginWarning')
    .end();
}
