'use strict';
define(
  [
    'angular',
    './analyses/analyses',
    'angular-patavi-client',
    'angular-animate',
    'angular-cookies',
    'angular-foundation-6',
    'angular-sanitize',
    'angular-touch',
    'angular-ui-router',
    './createModel/createModel',
    './constants',
    './controllers',
    'core-js',
    'error-reporting',
    'export-directive',
    'help-popup',
    'jquery',
    './models/models',
    'page-title-service',
    './patavi/patavi',
    // './resources',
    './services',
    './util/util'
  ],
  function(angular) {
    var dependencies = [
      'errorReporting',
      'export-directive',
      'gemtc.createModel',
      'gemtc.analyses',
      'gemtc.controllers',
      'gemtc.constants',
      'gemtc.models',
      'gemtc.patavi',
      // 'gemtc.resources',
      'gemtc.services',
      'gemtc.util',
      'help-directive',
      'mm.foundation',
      'ngCookies',
      'ngSanitize',
      'ngTouch',
      'page-title-service',
      'patavi',
      'ui.router'
    ];

    var app = angular.module('gemtc', dependencies);

    app.run([
      '$http',
      '$q',
      '$templateCache',
      'HelpPopupService',
      'PageTitleService',
      function(
        $http,
        $q,
        $templateCache,
        HelpPopupService,
        PageTitleService
      ) {
        $templateCache.put('model-settings-section.html', require('../views/model-settings-section.html'));
        $templateCache.put('convergence-diagnostics-section.html', require('../views/convergence-diagnostics-section.html'));
        $templateCache.put('meta-regression-section.html', require('../views/meta-regression-section.html'));
        $templateCache.put('results-section.html', require('../views/results-section.html'));
        $templateCache.put('model-fit-section.html', require('../views/model-fit-section.html'));

        HelpPopupService.loadLexicon($http.get('lexicon.json'));
        PageTitleService.loadLexicon($q.resolve(require('../gemtc-page-titles.json')));
      }
    ]);

    app.config([
      '$stateProvider',
      '$urlRouterProvider',
      '$httpProvider',
      '$provide',
      function(
        $stateProvider,
        $urlRouterProvider,
        $httpProvider,
        $provide
      ) {

        $provide.decorator('$uiViewScroll', function() {
          return function(uiViewElement) {
            window.scrollTo(0, (uiViewElement[0].getBoundingClientRect().top - 200));
          };
        });

        $httpProvider.interceptors.push('sessionExpiredInterceptor');

        $stateProvider
          .state('analyses', {
            url: '/analyses',
            templateUrl: './analyses/analyses.html',
            controller: 'AnalysesController'
          })
          .state('analysis-container', {
            abstract: true,
            templateUrl: './analyses/abstract-analysis.html',
          })
          .state('networkMetaAnalysis', {
            parent: 'analysis-container',
            url: '/analyses/:analysisId',
            views: {
              'analysis': {
                templateUrl: './analyses/analysis.html',
                controller: 'AnalysisController'
              },
              'models': {
                templateUrl: './models/models.html',
                controller: 'ModelsController'
              },
              'networkGraph': {
                templateUrl: './analyses/networkGraph.html',
                controller: 'NetworkGraphController'
              },
              'evidenceTable': {
                templateUrl: './analyses/evidenceTable.html',
                controller: 'EvidenceTableController'
              },
              'relativeEvidenceTable': {
                templateUrl: './analyses/relativeEvidenceTable.html',
                controller: 'RelativeEvidenceTableController'
              }
            }
          })
          .state('createModel', {
            url: '/analyses/:analysisId/models/createModel',
            templateUrl: 'js/models/createModel.html',
            controller: 'CreateModelController'
          })
          .state('refineModel', {
            url: '/analyses/:analysisId/models/:modelId/refineModel',
            templateUrl: 'js/models/createModel.html',
            controller: 'CreateModelController',
            resolve: {
              model: ['$stateParams', 'RefineModelService',
                function($stateParams, RefineModelService) {
                  return RefineModelService.getRefinedModel($stateParams);
                }
              ]
            }
          })
          .state('standalone-model-container', {
            templateUrl: 'js/models/standalone-model-container.html'
          })
          .state('model', {
            parent: 'standalone-model-container',
            url: '/analyses/:analysisId/models/:modelId',
            templateUrl: 'views/modelView.html',
            controller: 'ModelController'
          })
          .state('nodeSplitOverview', {
            parent: 'model',
            url: '/nodeSplitOverview',
            templateUrl: 'js/models/nodeSplitOverview.html',
            controller: 'NodeSplitOverviewController',
            resolve: {
              models: ['$stateParams', 'ModelResource',
                function($stateParams, ModelResource) {
                  return ModelResource.query({
                    analysisId: $stateParams.analysisId
                  }).$promise;
                }
              ],
              problem: ['$stateParams', 'ProblemResource',
                function($stateParams, ProblemResource) {
                  return ProblemResource.get({
                    analysisId: $stateParams.analysisId
                  }).$promise;
                }
              ]

            }
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
