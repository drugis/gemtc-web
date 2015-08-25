module.exports = function(browser, url) {
  browser
    .url(url)
    .waitForElementVisible('button[type="submit"]', 50000)
    .click('button[type="submit"]')
  if (process.env.GEMTC_NIGHTWATCH_URL === 'http://localhost:3001') {
    browser.waitForElementVisible('body', 50000)
      .assert.containsText('h2', 'Sign in with your Google Account')
      .pause(1000)
      .setValue('input[type=email]', 'addistestuser1@gmail.com')
      .click('input[type="submit"]')
      .pause(1000)
      .setValue('input[type=password]', 'speciaalvoordejenkins')
      .click('#signIn')
      .pause(3000) // wait for submit button to become active (thanks for keeping us safe google)
    .click('#submit_approve_access')
  }

  return browser;
};