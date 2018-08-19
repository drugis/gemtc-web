'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.util', dependencies)

    //resources
    .factory('UserResource', require('./userResource'))

    // directive
    .directive('navbarDirective', require('./navbarDirective'))
    .directive('fileReader', require('./fileReaderDirective'))
    .directive('pagedSvgPlot', require('./pagedSvgPlotDirective'))
    .directive('pagedPngPlot', require('./pagedPngPlotDirective'))
    .directive('graphModal', require('./graphModalDirective/graphModalDirective'))

    // controllers
    .controller('PlotNavigationController', require('./graphModalDirective/plotNavigationController'))

    // interceptors
    .factory('sessionExpiredInterceptor', require('./sessionExpiredInterceptor'))

    // services
    .factory('ProblemValidityService', require('./problemValidityService'))
    .factory('CSVParseService', require('./csvParseService'))
    .factory('FileUploadService', require('./fileUploadService'))
    ;
});
