var browser;
var assert = require('assert');
function ModelResultPage(browserArg) {
  browser = browserArg;
}

ModelResultPage.prototype = {
  waitForPageToLoad: function() {
    browser.waitForElementVisible('#model-results-header', 50000);
  },
  end: function() {
    browser.end();
  },
  waitForResults: function() {
    browser.waitForElementVisible('#model-results-results-header', 80000);
  },
  extendRunLength: function () {
    browser
      .click('#open-run-length-dialog-btn')
      .setValue('#nr-burn-in-input', '110')
      .setValue('#nr-inference-input', '60')
      .click('#submit-extend-run-length-btn');
  },
  showConvergenceDiagnostics: function() {
    browser.click('#show-convergence-diagnostics');
  },
  hideConvergenceDiagnostics: function() {
    browser.click('#hide-convergence-diagnostics');
  },
  assertDirectiveImagesRendered: function(directiveName) {
    browser.elements('tag name', directiveName, function(result) {
      result.value.map(function(v) {
        browser.elementIdElement(v.ELEMENT, 'tag name', 'img', function(imgResult) {
          browser.elementIdSize(imgResult.value.ELEMENT, function(sizeResult) {
            assert(sizeResult.value.height > 0);
            assert(sizeResult.value.width > 0);
          });
        });
      });
    });
  }
};

module.exports = ModelResultPage;
