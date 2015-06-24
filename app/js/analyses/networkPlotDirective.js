'use strict';
define([], function() {
  var dependencies = ['$window', 'NetworkPlotService'];
  var NetworkPlotDirective = function($window, NetworkPlotService) {
    return {
      scope: {
        network: '=',
        sizingElementId: '='
      },
      restrict: 'E',
      template: '<div id="network-graph"><svg></svg></div>',
      link: function(scope, element) {

        /**
         * Directive can be supplied with a id pointing to a element on the page that determines the graphs with and height.
         * If no id is supplied, the directives parent element is used for sizing
         **/
        var sizingElement;
        if (scope.sizingElementId) {
          sizingElement = $('#' + scope.sizingElementId);
        } else {
          sizingElement = element.parent();
        }

        var width = sizingElement.width();
        var height = sizingElement.height();

        scope.$watch('network', function(newValue, oldValue) {
          if (oldValue !== newValue) {
            NetworkPlotService.drawNetwork(newValue, width, height);
          }
        });

        angular.element($window).bind('resize', function() {
          NetworkPlotService.drawNetwork(scope.network, sizingElement.width(), sizingElement.height());
        });

      }
    };
  };
  return dependencies.concat(NetworkPlotDirective);
});