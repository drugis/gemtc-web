'use strict';
define([
  './createModelService',
  'angular'
], function(
  CreateModelService,
  angular
) {
    return angular.module('gemtc.createModel', [])
      .factory('CreateModelService', CreateModelService)
      ;
  });
