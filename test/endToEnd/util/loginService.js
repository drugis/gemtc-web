'use strict';

module.exports = {
    login: login
};

const constants = require('./constants');

const USER_NAME = 'user';
const PASSWORD = 'test';

function login(browser, username = USER_NAME, password = PASSWORD) {
    browser
        .url(constants.TEST_URL)
        .waitForElementVisible('#signinButton', 5000)
        .setValue('#username', username)
        .setValue('#password', password)
        .click('#signinButton')
        .waitForElementVisible('#analyses-header');
    return browser;
}
