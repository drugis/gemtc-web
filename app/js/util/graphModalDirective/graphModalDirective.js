'use strict';
define([], function() {
  var dependencies = ['$modal', 'gemtcRootPath'];
  var GraphModalDirective = function($modal, gemtcRootPath) {
    return {
      scope: {
        diagnosticsMap: '=',
        selectedComparison: '='
      },
      restrict: 'E',
      // using template because loading teplateUrl irritating in submodule
      templateUrl: gemtcRootPath + 'js/util/graphModalDirective/graphModalDirective.html',
      link: function(scope) {

        scope.openModal = function() {
          $modal.open({
            templateUrl: gemtcRootPath + 'js/util/graphModalDirective/plotNavigation.html',
            scope: scope,
            windowClass: 'small',
            controller: 'PlotNavigationController'
          });
        };
      }
    };
  };
  return dependencies.concat(GraphModalDirective);
});
