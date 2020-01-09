'use strict';

function isErrorBarNotPresent(browser) {
  return browser
    .useXpath()
    .assert.not.elementPresent('/html/body/error-reporting')
    .useCss();
}

function isErrorBarHidden(browser) {
  return browser
    .useXpath()
    .assert.not.visible('/html/body/error-reporting')
    .useCss();
}

module.exports = {
  isErrorBarNotPresent: isErrorBarNotPresent,
  isErrorBarHidden: isErrorBarHidden
};
