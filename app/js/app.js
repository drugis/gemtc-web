'use strict';
define(
  ['angular',
    'require',
    'jQuery',
    'mmfoundation',
    'foundation',
    'angular-ui-router',
    'angularanimate',
    'ngSanitize',
    'controllers',
    'constants',
    'directives',
    'resources',
    'services',
    'analyses/analyses',
    'util/util'
  ],
  function(angular, require, $, Config) {

    var dependencies = [
      'ui.router',
      'ngSanitize',
      'mm.foundation.tpls',
      'mm.foundation.modal',
      'mm.foundation.tpls',
      'gemtc.controllers',
      'gemtc.resources',
      'gemtc.constants',
      'gemtc.services',
      'gemtc.directives',
      'gemtc.analyses',
      'gemtc.util'
    ];

    var app = angular.module('gemtc', dependencies);

    app.run(['$rootScope', '$window', '$http',
      function($rootScope, $window, $http) {

        $rootScope.$on('$viewContentLoaded', function() {
          $(document).foundation();
        });

        $rootScope.$safeApply = function($scope, fn) {
          var phase = $scope.$root.$$phase;
          if (phase === '$apply' || phase === '$digest') {
            this.$eval(fn);
          } else {
            this.$apply(fn);
          }
        };

        $rootScope.$on('patavi.error', function(e, message) {
          $rootScope.$safeApply($rootScope, function() {
            $rootScope.error = _.extend(message, {
              close: function() {
                delete $rootScope.errors;
              }
            });
          });

        });
      }
    ]);

    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
      function($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider
          .state('analyses', {
            url: '/analyses',
            templateUrl: '/js/analyses/analyses.html',
            controller: 'AnalysesController'
          })
          .state('analysis', {
            url: '/analyses/:analysisId',
            templateUrl: '/js/analyses/analysis.html',
            controller: 'AnalysisController'
          })
          ;

        // Default route
        $urlRouterProvider.otherwise('/analyses');
      }
    ]);

    return app;
  });
