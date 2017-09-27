'use strict';

require.config({
  paths: {
    'gemtc-web': '.',
    'jQuery': 'bower_components/jquery/dist/jquery.min',
    'angular': 'bower_components/angular/angular',
    'angular-resource': 'bower_components/angular-resource/angular-resource',
    'angular-touch': 'bower_components/angular-touch/angular-touch',
    'angular-ui-router': 'bower_components/angular-ui-router/release/angular-ui-router',
    'angularanimate': 'bower_components/angular-animate/angular-animate.min',
    'clipboard': 'bower_components/clipboard/dist/clipboard.min',
    'domReady': 'bower_components/requirejs-domready/domReady',
    'foundation': 'bower_components/foundation-sites/dist/js/foundation.min',
    'modernizr': 'bower_components/modernizr/modernizr',
    'lodash': 'bower_components/lodash/dist/lodash.min',
    'd3': 'bower_components/d3/d3',
    'nvd3': 'bower_components/nvd3/build/nv.d3',
    'moment': 'bower_components/moment/min/moment.min',
    'mmfoundation': 'bower_components/angular-foundation-6/dist/angular-foundation.min',
    'ngSanitize': 'bower_components/angular-sanitize/angular-sanitize.min',
    'papaparse': 'bower_components/papaparse/papaparse.min',
    'help-popup': 'bower_components/help-popup/help-directive',
    'angular-patavi-client': 'bower_components/angular-patavi-client/patavi',
    'error-reporting': 'bower_components/error-reporting/errorReportingDirective'
  },
  shim: {
    'jQuery': {
      exports: 'jQuery'
    },
    'angular': {
      deps: ['jQuery'],
      exports: 'angular'
    },
    'angular-touch': {
      deps: ['angular'],
      exports: 'ngTouch'
    },
    'angularanimate': {
      deps: ['angular']
    },
    'mmfoundation': {
      deps: ['angular']
    },
    'help-popup': {
      deps: ['angular']
    },
    'error-reporting': {
      deps: ['angular']
    },
    'angular-resource': {
      deps: ['angular'],
      exports: 'angular-resource'
    },
    'angular-ui-router': {
      deps: ['angular']
    },
    'ngSanitize': {
      deps: ['angular'],
      exports: 'ngSanitize'
    },
    'd3': {
      exports: 'd3'
    },
    'nvd3': {
      deps: ['d3'],
      exports: 'nv'
    },
    'lodash': {
      exports: '_'
    },
    'foundation': {
      deps: ['jQuery', 'modernizr']
    },
    'domReady': {
      exports: 'domReady'
    }
  },
  priority: ['angular']
});

window.name = 'NG_DEFER_BOOTSTRAP!';

require(['require', 'angular', 'app'], function(require, angular) {
  require(['domReady!'], function(document) {
    angular.bootstrap(document, ['gemtc']);
  });
});
