'use strict';
define(function (require) {
  var angular = require('angular');
  return angular.module('gemtc.filters', [])
    .filter('distributionToStringFilter', require('gemtc-web/models/distributionToStringFilter'))
    ;
});
