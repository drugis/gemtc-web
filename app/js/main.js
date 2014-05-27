'use strict';

require.config({
  paths: {
    'jQuery': 'bower_components/jquery/jquery.min',
    'underscore': 'bower_components/underscore/underscore-min',
    'angular': 'bower_components/angular/angular.min',
    'angular-resource': 'bower_components/angular-resource/angular-resource.min',
    'angular-ui-router': 'bower_components/angular-ui-router/release/angular-ui-router.min',
    'd3': 'bower_components/d3/d3.min',
    'nvd3': 'bower_components/nvd3/nv.d3.min',
    'MathJax': 'bower_components/MathJax/MathJax.js?config=TeX-MML-AM_HTMLorMML',
    'foundation': 'bower_components/foundation/js/foundation.min',
    'domReady': 'bower_components/requirejs-domready/domReady',
    'gemtc-web': '.'
  },
  baseUrl: '.',
  shim: {
    'angular': { exports : 'angular' },
    'angular-resource': { deps:['angular'], exports: 'angular-resource' },
    'angular-ui-router': { deps:['angular'] },
    'underscore': { exports : '_' },
    'MathJax' : { exports: 'MathJax' },
    'd3': { exports : 'd3' },
    'nvd3': { deps: ['d3'], exports : 'nv' },
    'jQuery': { exports : 'jQuery' },
    'jquery-slider': { deps: ['jQuery'] },
    'NProgress': { deps: ['jQuery'], exports: "NProgress" },
    'foundation':  { deps: ['jQuery'] }
  },
  priority: ['angular']
});

window.name = "NG_DEFER_BOOTSTRAP!";

require(['require', 'angular', 'gemtc/app'], function (require, angular) {
  require(['domReady!'], function (document) {
    angular.bootstrap(document , ['elicit']);
  });
});