'use strict';
define(['angular'], function (angular) {
  var dependencies = [
    '$q',
    '$stateParams',
    '$injector',
    '$window',
    'NetworkPlotService',
    'AnalysisResource'
  ];
  var NetworkPlotDirective = function (
    $q,
    $stateParams,
    $injector,
    $window,
    NetworkPlotService,
    AnalysisResource
  ) {
    return {
      scope: {
        analysisId: '=',
        network: '=',
        sizingElementId: '='
      },
      restrict: 'E',
      template:
        '<div class="network-graph"><svg export file-name="\'networkPlot\'"></svg></div>',
      link: function (scope, element) {
        /**
         * Directive can be supplied with a id pointing to a element on the page that determines the graphs with and height.
         * If no id is supplied, the directives parent element is used for sizing
         **/
        var sizingElement;
        if (scope.sizingElementId) {
          sizingElement = angular.element(
            document.querySelector('#' + scope.sizingElementId)
          );
        } else {
          sizingElement = element.parent();
        }

        var width = sizingElement[0].clientWidth;
        var height = sizingElement[0].clientHeight;

        if (scope.analysisId !== undefined) {
          // we're in ADDIS not gemtc
          var InterventionResource = $injector.get('InterventionResource');
          var EvidenceTableResource = $injector.get('EvidenceTableResource');
          var NetworkMetaAnalysisService = $injector.get(
            'NetworkMetaAnalysisService'
          );
          var analysis = AnalysisResource.get({
            projectId: $stateParams.projectId,
            analysisId: scope.analysisId
          });
          var interventions = InterventionResource.query($stateParams);
          $q.all([analysis.$promise, interventions.$promise]).then(function () {
            EvidenceTableResource.query({
              projectId: $stateParams.projectId,
              analysisId: analysis.id
            }).$promise.then(function (trialverseData) {
              interventions = NetworkMetaAnalysisService.addInclusionsToInterventions(
                interventions,
                analysis.interventionInclusions
              );
              var includedInterventions = NetworkMetaAnalysisService.getIncludedInterventions(
                interventions
              );
              var momentSelections = NetworkMetaAnalysisService.buildMomentSelections(
                trialverseData,
                analysis
              );
              var network = NetworkMetaAnalysisService.transformStudiesToNetwork(
                trialverseData,
                includedInterventions,
                analysis,
                momentSelections
              );
              NetworkPlotService.drawNetwork(network, element, width, height);
            });
          });
        }
        scope.$watch(
          'network.network',
          function (newValue) {
            NetworkPlotService.drawNetwork(newValue, element, width, height);
          },
          true
        );

        angular.element($window).bind('resize', function () {
          if (!scope.network) {
            return;
          }
          NetworkPlotService.drawNetwork(
            scope.network.network,
            element,
            sizingElement[0].clientWidth,
            sizingElement[0].clientHeight
          );
        });
      }
    };
  };
  return dependencies.concat(NetworkPlotDirective);
});
