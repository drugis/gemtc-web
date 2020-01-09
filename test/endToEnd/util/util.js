'use strict';
const _ = require('lodash');
const chai = require('chai');

const TIMEOUT = 10;

function delayedClick(browser, clickPath, expectPath, attempts = 50) {
  if (attempts === 0) {
    throw new Error('! Could not locate "' + expectPath + '".');
  } else {
    const selectorType = 'css selector';
    browser.waitForElementVisible(clickPath);
    browser.click(clickPath);
    browser.elements(selectorType, expectPath, function(result) {
      if (result.value.length === 0) {
        console.log('! Could not locate "' + expectPath + '". Attempting again in ' + TIMEOUT + ' milliseconds.');
        browser.pause(TIMEOUT);
        delayedClick(browser, clickPath, expectPath, --attempts);
      }
    });
  }
  return browser;
}

module.exports = {
  delayedClick: delayedClick
};
