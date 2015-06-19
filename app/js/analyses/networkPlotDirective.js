'use strict';
define([], function() {
  var dependencies = ['NetworkPlotService'];
  var NetworkPlotDirective = function(NetworkPlotService) {
    return {
      scope: {
        network: '='
      },
      restrict: 'E',
      template: '<div id="network-graph"><svg></svg></div>',
      link: function(scope, element) {

        scope.$watch('network', function(newValue, oldValue) {
          if (oldValue !== newValue) {
            console.log('no do draw');
            NetworkPlotService.drawNetwork(newValue, element);
          }
        });

      }
    };
  };
  return dependencies.concat(NetworkPlotDirective);
});