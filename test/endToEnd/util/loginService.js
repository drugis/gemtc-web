'use strict';
const TEST_URL = 'http://localhost:3001';
const USER_NAME = 'user';
const PASSWORD = 'test';

function login(browser, username = USER_NAME, password = PASSWORD) {
    browser
        .url(TEST_URL)
        .waitForElementVisible('#signinButton', 5000)
        .setValue('#username', username)
        .setValue('#password', password)
        .click('#signinButton')
        .waitForElementVisible('#analyses-header');
    return browser;
}

module.exports = {
    login: login,
    TEST_URL:TEST_URL
};
