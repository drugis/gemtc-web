'use strict';
define(function(require) {
  var angular = require('angular');
  return angular.module('gemtc.services', [])
    .factory('PataviService', require('gemtc-web/services/pataviService'));
});