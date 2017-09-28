'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.util', dependencies)

    //resources
    .factory('UserResource', require('util/userResource'))

    // directive
    .directive('navbarDirective', require('util/navbarDirective'))
    .directive('fileReader', require('util/fileReaderDirective'))
    .directive('pagedSvgPlot', require('util/pagedSvgPlotDirective'))
    .directive('pagedPngPlot', require('util/pagedPngPlotDirective'))
    .directive('export', require('util/exportDirective'))
    .directive('graphModal', require('util/graphModalDirective/graphModalDirective'))

    // controllers
    .controller('PlotNavigationController', require('util/graphModalDirective/plotNavigationController'))

    // interceptors
    .factory('sessionExpiredInterceptor', require('util/sessionExpiredInterceptor'))

    // services
    .factory('ProblemValidityService', require('util/problemValidityService'))
    .factory('CSVParseService', require('util/csvParseService'))
    .factory('FileUploadService', require('util/fileUploadService'))
    ;
});
