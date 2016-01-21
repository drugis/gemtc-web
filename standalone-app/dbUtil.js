'use strict';
var logger = require('./logger');

module.exports = {
  pataviDBUrl: buildPataviDBUrl(),
  gemtcDBUrl: buildGemtcDBUrl()
};

function buildPataviDBUrl() {
  var env = process.env;
  var url = buildUrl(env.DB_HOST,
    env.PATAVI_TASK_DB,
    env.PATAVI_TASK_DB_USERNAME,
    env.PATAVI_TASK_DB_PASSWORD);
  logger.info('Patavi db url: ' + url);
  return url;
}

function buildGemtcDBUrl() {
  var env = process.env;
  var url = buildUrl(env.DB_HOST,
    env.GEMTC_DB,
    env.GEMTC_DB_USERNAME,
    env.GEMTC_DB_PASSWORD);
  logger.info('Gemtc db url: ' + url);
  return url;
}

function buildUrl(hostname, database, username, password) {
  return 'postgres://' + username + ':' + password + '@' + hostname + '/' + database;
}
