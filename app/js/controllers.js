'use strict';
define(function(require) {
  var angular = require('angular');
    return angular.module('gemtc.controllers', [])
          .controller('ModelController', require('gemtc-web/controllers/modelController'))
});