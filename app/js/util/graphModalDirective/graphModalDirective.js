'use strict';
define([], function() {
  var dependencies = ['$modal', 'gemtcRootPath'];
  var GraphModalDirective = function($modal, gemtcRootPath) {
    return {
      scope: {
        gelmanDiagnostics: '=',
        convergenceData: '=',
        selectedComparison: '='
      },
      restrict: 'E',
      // using template because loading teplateUrl irritating in submodule
      templateUrl: gemtcRootPath + 'js/util/graphModalDirective/graphModalDirective.html',
      link: function(scope, element) {
        scope.structuredPlots = _.indexBy(_.map(scope.gelmanDiagnostics, function(diagnostic, index) {
          return {
            label: diagnostic.label,
            // 'traceplots' contains both trace & density plots, alternating
            tracePlot: scope.convergenceData.traceplots[2 * index],
            densityPlot: scope.convergenceData.traceplots[2 * index + 1],
            psrfPlot: scope.convergenceData.psrfPlots[index]
          };
        }), 'label');

        scope.openModal = function(selectedComparison) {
          scope.selectedDiagnostic = selectedComparison;
          $modal.open({
            templateUrl: gemtcRootPath + 'js/util/graphModalDirective/plotNavigation.html',
            scope: scope,
            windowClass: 'small',
            controller: 'PlotNavigationController'
          });
        }
      }
    };
  };
  return dependencies.concat(GraphModalDirective);
});