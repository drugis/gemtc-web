'use strict';

const loginService = require('./util/loginService.js');

function loginSucces(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header')
    .assert.containsText('#analyses-header', 'Analyses')
    .end();
}

function loginFail(browser) {
  loginService.login(browser, 'wrong name', 'wrong password')
    .waitForElementVisible('#loginWarning')
    .end();
}

module.exports = {
  'Login success': loginSucces,
  'Login fail': loginFail
};
