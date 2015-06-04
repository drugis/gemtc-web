'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = [];

  return angular.module('gemtc.util', dependencies)

    //resources
    .factory('UserResource', require('util/userResource'))

    // directive
    .directive('navbarDirective', require('util/navbarDirective'))
    .directive('fileReader', require('util/fileReaderDirective'))
    ;
});
