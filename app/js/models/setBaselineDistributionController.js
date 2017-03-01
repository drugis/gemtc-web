'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', 'AnalysisService',
    'outcomeWithAnalysis', 'interventionInclusions', 'setBaselineDistribution', 'alternatives'
  ];
  var SetBaselineDistributionController = function($scope,
    $modalInstance, AnalysisService, outcomeWithAnalysis, interventionInclusions,
    setBaselineDistribution, alternatives) {

    $scope.outcomeWithAnalysis = outcomeWithAnalysis;
    if (!interventionInclusions) { // in gemtc there's no inclusions
      $scope.alternatives = alternatives;
    } else {
      $scope.alternatives = _.filter(alternatives, function(alternative) {
        return _.find(interventionInclusions, function(interventionInclusion) {
          return interventionInclusion.interventionId === alternative.id;
        });
      });
    }

    $scope.baselineDistribution = {
      selectedAlternative: $scope.alternatives[0]
    };
    $scope.baselineDistribution.scale = _.find(AnalysisService.LIKELIHOOD_LINK_SETTINGS, function(setting) {
      return setting.likelihood === outcomeWithAnalysis.selectedModel.likelihood &&
        setting.link === outcomeWithAnalysis.selectedModel.link;
    }).absoluteScale;

    $scope.setBaselineDistribution = function(baselineDistribution) {
      if (baselineDistribution.selectedAlternative) {
        baselineDistribution.name = baselineDistribution.selectedAlternative.name;
      }
      baselineDistribution.type = 'dnorm';
      delete baselineDistribution.selectedAlternative;
      setBaselineDistribution(baselineDistribution);
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  };
  return dependencies.concat(SetBaselineDistributionController);
});
