'use strict';
var logger = require('./logger');

module.exports = {
  gemtcDBUrl: buildGemtcDBUrl(),
  connectionConfig: buildGemtcDBConnectionConfig()
};

function buildGemtcDBUrl() {
  var env = process.env;
  var url = buildUrl(env.DB_HOST,
    env.GEMTC_DB,
    env.GEMTC_DB_USERNAME,
    env.GEMTC_DB_PASSWORD);
  logger.info('Gemtc db url: ' + url);
  return url;
}

function buildGemtcDBConnectionConfig() {
  var env = process.env;
  return {
    user: env.GEMTC_DB_USERNAME,
    database: env.GEMTC_DB,
    password: env.GEMTC_DB_PASSWORD
  };
}

function buildUrl(hostname, database, username, password) {
  return 'postgres://' + username + ':' + password + '@' + hostname + '/' + database;
}
