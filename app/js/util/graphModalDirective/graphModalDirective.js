'use strict';
define([], function() {
  var dependencies = ['$modal'];
  var GraphModalDirective = function($modal) {
    return {
      scope: {
        diagnosticsMap: '=',
        selectedComparison: '=',
        parameterIndex: '='
      },
      restrict: 'E',
      templateUrl: './graphModalDirective.html',
      link: function(scope) {

        scope.openModal = function() {
          $modal.open({
            templateUrl: './plotNavigation.html',
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
