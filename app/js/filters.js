'use strict';
define([
  './models/distributionToStringFilter',
  'angular'
],
  function(
    distributionToStringFilter,
    angular
  ) {
    return angular.module('gemtc.filters', [])
      .filter('distributionToStringFilter', distributionToStringFilter)
      ;
  }
);
