'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.patavi', dependencies)
    // resources
    .factory('PataviTaskIdResource', require('patavi/pataviTaskIdResource'))

    ;
});
