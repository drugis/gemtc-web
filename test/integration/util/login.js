module.exports = function(browser, url){
    return browser
      .url(url)
      .waitForElementVisible('body', 50000)
      .click('button[type="submit"]')
      .waitForElementVisible('body', 50000)
      .assert.containsText('h2', 'Sign in with your Google Account')
      .pause(1000)
      .setValue('input[type=email]', 'addistestuser1@gmail.com')
      .click('input[type="submit"]')
      .pause(1000)
      .setValue('input[type=password]', 'speciaalvoordejenkins')
      .click('#signIn')
      .pause(3000) // wait for submit button to become active (thanks for keeping us safe google)
      .click('#submit_approve_access')
};
