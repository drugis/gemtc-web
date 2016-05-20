'use strict';
var express = require('express'),
  pataviHandlers = require('./pataviHandlers');

module.exports = express.Router({
  mergeParams: true
})
  .get('/', pataviHandlers.getPataviTask);
