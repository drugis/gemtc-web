'use strict';
define([
  './createModelService',
  './createModelController',
  'angular'
], function(
  CreateModelService,
  CreateModelController,

  angular
) {
    return angular.module('gemtc.createModel', [])
      .controller('CreateModelController', CreateModelController)
      .factory('CreateModelService', CreateModelService)
      ;
  });
