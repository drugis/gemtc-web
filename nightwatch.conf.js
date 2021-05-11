'use strict';

const seleniumServer = require('selenium-server');
const geckodriver = require('geckodriver');

module.exports = {
  src_folders: ['test/endToEnd'],
  selenium: {
    check_process_delay: 1000,
    start_process: true,
    server_path: seleniumServer.path,
    host: 'localhost',
    port: 4444,
    cli_args: {
      'webdriver.gecko.driver': geckodriver.path
    }
  },
  test_settings: {
    default: {
      globals: {
        waitForConditionTimeout: 5000
      },
      exclude: ['*/*.js'],
      desiredCapabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          args: ['-headless']
        },
        javascriptEnabled: true,
        acceptSslCerts: true,
        acceptInsecureCerts: true
      }
    }
  }
};
