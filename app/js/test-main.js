'use strict';

var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (file.indexOf("Spec.js") != -1 && file.indexOf("bower_components") == -1 && file.indexOf("node_modules") == -1) {
      tests.push(file);
    }
  }
}

console.log(tests);

require.config({
  paths: {
    'jQuery': 'bower_components/jquery/jquery.min',
    'lodash': 'bower_components/lodash/lodash.min',
    'angular': 'bower_components/angular/angular',
    'angular-resource': 'bower_components/angular-resource/angular-resource',
    'angular-ui-router': 'bower_components/angular-ui-router/release/angular-ui-router',
    'jquery-slider': 'lib/jslider/bin/jquery.slider.min',
    'd3': 'bower_components/d3/d3.min',
    'nvd3': 'bower_components/nvd3/build/nv.d3.min',
    'MathJax': 'bower_components/MathJax/MathJax.js?config=TeX-MML-AM_HTMLorMML',
    'foundation': 'bower_components/foundation/js/foundation.min',
    'jasmine': 'bower_components/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'bower_components/jasmine/lib/jasmine-core/jasmine-html',
    'angular-mocks': 'bower_components/angular-mocks/angular-mocks',
    'papaparse': 'bower_components/papaparse/papaparse.min',
    'gemtc-web': '.'
  },
  baseUrl: '/base/app/js',
  shim: {
    'angular': {
      exports: 'angular'
    },
    'angular-resource': {
      deps: ['angular'],
      exports: 'angular-resource'
    },
    'angular-mocks': {
      deps: ['angular'],
      exports: 'angular.mock'
    },
    'angular-ui-router': {
      deps: ['angular'],
      exports: 'angular-ui-router'
    },
    'lodash': {
      exports: '_'
    },
    'd3': {
      exports: 'd3'
    },
    'nvd3': {
      deps: ['d3'],
      exports: 'nv'
    },
    'jQuery': {
      exports: 'jQuery'
    },
    'jquery-slider': {
      deps: ['jQuery']
    },
    'jasmine': {
      exports: 'jasmine'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine'
    }
  },
  priority: ['angular'],

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});

window.name = "NG_DEFER_BOOTSTRAP!";
