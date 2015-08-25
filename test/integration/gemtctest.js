module.exports = {
  'Gemtc attract mode' : function (browser) {
    browser
      .url(process.env.GEMTC_NIGHTWATCH_URL)
      .waitForElementVisible('body', 1000)
      .pause(1000)
      .assert.containsText('h1', 'gemtc.drugis.org')
      .end();
  }
};
