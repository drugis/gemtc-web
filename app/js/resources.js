'use strict';
define(function(require) {
  var angular = require('angular', '');
  return angular.module('gemtc.resources', ['ngResource'])
    .factory('ModelResource', require('gemtc-web/resources/modelResource'))
    .factory('ProblemResource', require('gemtc-web/resources/problemResource'));
});