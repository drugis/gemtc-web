'use strict';
var requires = ['gemtc-web/models/distributionToStringFilter'];
define(requires.concat(['angular']),function (
	distributionToStringFilter,
	 angular
	) {
  return angular.module('gemtc.filters', [])
    .filter('distributionToStringFilter', distributionToStringFilter)
    ;
});
