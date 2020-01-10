'use strict';

module.exports = {
  'Logout': logout,
};

const loginService = require('./util/loginService');

function logout(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header')
    .moveToElement('#user-image-link', 0, 0)
    .moveToElement('#logout-link', 0, 0)
    .click('#logout-link')
    .waitForElementVisible('#signinButton')
    .end();
}
