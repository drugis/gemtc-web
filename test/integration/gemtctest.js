module.exports = {
  'Gemtc attract mode' : function (browser) {
    browser
      .url('http://localhost:3001')
      .waitForElementVisible('body', 1000)
      .pause(1000)
      .assert.containsText('h1', 'gemtc.drugis.org')
      .end();
  }
};
