var express = require('express');
var pataviHandlers = require('./pataviHandlers')

module.exports = express.Router({
  mergeParams: true
})
  .get('/', pataviHandlers.getPataviTask);
