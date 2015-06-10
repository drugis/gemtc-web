'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.models', dependencies)
    // resources
    .factory('ModelResource', require('models/standaloneModelResource'))
    .factory('ProblemResource', require('models/standaloneProblemResource'))
    ;
});
