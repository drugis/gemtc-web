'use strict';
define(function(require) {
  var angular = require('angular');
  return angular.module('gemtc.constants', [])
    .constant('GEMTC_PATAVI_WS', 'wss://patavi.drugis.org/ws')
    .constant('gemtcRootPath', (function() {
      return require.toUrl(".").replace("js", "");
    })());
});
