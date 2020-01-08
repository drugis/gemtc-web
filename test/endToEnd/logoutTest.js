'use strict';

const loginService = require('./util/loginService.js');

function logout(browser) {
  loginService.login(browser)
    .waitForElementVisible('#analyses-header')
    .moveToElement('#user-image-link', 0, 0)
    .moveToElement('#logout-link', 0, 0)
    .click('#logout-link')
    .waitForElementVisible('#signinButton')
    .end();
}
module.exports = {
  'Logout': logout,
};
