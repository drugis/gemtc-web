'use strict';
define(['angular'], function(angular) {
  return angular.module('gemtc.constants', [])
    .constant('GEMTC_PATAVI_WS', 'wss://patavi.drugis.org/ws');
});
