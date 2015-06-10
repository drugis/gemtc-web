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
    // 'resources',
    'services',
    'analyses/analyses',
    'models/models',
    'util/util',
    'patavi/patavi'
  ],
  function(angular, require, $, Config) {

    var dependencies = [
      'ui.router',
      'ngSanitize',
      'mm.foundation.tpls',
      'mm.foundation.modal',
      'gemtc.controllers',
      // 'gemtc.resources',
      'gemtc.constants',
      'gemtc.services',
      'gemtc.directives',
      'gemtc.analyses',
      'gemtc.models',
      'gemtc.util',
      'gemtc.patavi'
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

        $httpProvider.interceptors.push('sessionExpiredInterceptor');

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
          .state('analysis.model', {
            url: '/models/:modelId',
            templateUrl: 'views/modelView.html',
            controller: 'ModelController'
          })
          .state('error', {
            url: '/error',
            // need to use template instead of url because we can't get new files from crashed server
            template: '  <section> ' +
              ' <div class="row"> ' +
              ' <div class="columns large-offset-2 large-8 medium-12"> ' +
              ' <h1>Error</h1> ' +
              ' </h1> ' +
              ' </div> ' +
              ' </div> ' +
              ' </section> ' +

              ' <section class="content"> ' +
              ' <div class="row"> ' +
              '  <div class="columns large-offset-2 large-8 medium-12"> ' +
              '     Sorry! An unknown error has occurred. Please sign in again. ' +
              ' If the problem persists please contact the developers via <a href="https://www.drugis.org/contact">our contact page</a> ' +
              '     <form id="SignInForm" action="auth/google" method="GET"> ' +
              '   <input type="hidden" name="scope" value="profile email" /> ' +
              '   <div> ' +
              '   <button class=" button" type="submit" tabindex="1" >Sign In with Google</button> ' +
              ' </div> ' +
              ' </form> ' +
              '     </div> ' +
              ' </div> ' +
              ' </section> '
          });

        // Default route
        $urlRouterProvider.otherwise('/analyses');
      }
    ]);

    return app;
  });
