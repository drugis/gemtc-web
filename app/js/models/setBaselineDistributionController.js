'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', 'AnalysisService',
    'outcomeWithAnalysis', 'interventionInclusions', 'setBaselineDistribution', 'alternatives', 'problem'
  ];
  var SetBaselineDistributionController = function($scope,
    $modalInstance, AnalysisService, outcomeWithAnalysis, interventionInclusions,
    setBaselineDistribution, alternatives, problem) {
    $scope.isModelBaseline = !!problem;
    $scope.selections = {};
    $scope.outcomeWithAnalysis = outcomeWithAnalysis;
    $scope.armSelectionChanged = armSelectionChanged;
    $scope.alternativeSelectionChanged = alternativeSelectionChanged;

    $scope.isInValidBaseline = isInValidBaseline;

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
      selectedAlternative: $scope.alternatives[0],
      type: 'dnorm'
    };
    $scope.baselineDistribution.scale = _.find(AnalysisService.LIKELIHOOD_LINK_SETTINGS, function(setting) {
      return setting.likelihood === outcomeWithAnalysis.selectedModel.likelihood &&
        setting.link === outcomeWithAnalysis.selectedModel.link;
    }).absoluteScale;

    if ($scope.isModelBaseline) {
      $scope.arms = buildArms(problem);
      $scope.selections.armIdx = 0;
      $scope.armSelectionChanged();
    }

    function buildArms(problem) {
      var filteredEntries = _.filter(problem.entries, ['treatment', $scope.baselineDistribution.selectedAlternative.id]);

      if ($scope.baselineDistribution.scale === 'log odds') {
        return _.map(filteredEntries, function(entry, idx) {
          return {
            idx: idx,
            studyName: entry.study,
            alternativeName: $scope.baselineDistribution.selectedAlternative.name,
            performance: entry.responders + '/' + entry.sampleSize,
            responders: entry.responders,
            sampleSize: entry.sampleSize
          };
        });
      } else if ($scope.baselineDistribution.scale === 'mean') {
        return _.map(filteredEntries, function(entry, idx) {
          return {
            idx: idx,
            studyName: entry.study,
            alternativeName: $scope.baselineDistribution.selectedAlternative.name,
            performance: 'μ: ' + entry.mean + ' / σ: ' + entry['std.dev'],
            mu: entry.mean,
            sigma: entry['std.dev'],
            sampleSize: entry.sampleSize
          };
        });
      }
    }

    function armSelectionChanged() {
      var selectedArm = $scope.arms[$scope.selections.armIdx];
      var newBaselineDistribution = {
        selectedAlternative: $scope.baselineDistribution.selectedAlternative,
        scale: $scope.baselineDistribution.scale,
        name: selectedArm.alternativeName

      };
      if ($scope.baselineDistribution.scale === 'log odds') {
        newBaselineDistribution.alpha = selectedArm.responders + 1;
        newBaselineDistribution.beta = selectedArm.sampleSize - selectedArm.responders + 1;
        newBaselineDistribution.type = 'dbeta-logit';
      } else if ($scope.baselineDistribution.scale === 'mean') {
        newBaselineDistribution.mu = selectedArm.mu;
        newBaselineDistribution.sigma = selectedArm.sigma;
        newBaselineDistribution.type = 'dnorm';
      } else {
        return;
      }
      $scope.baselineDistribution = newBaselineDistribution;
    }


    function isInValidBaseline(baselineDistribution) {
      if (baselineDistribution.scale === 'log odds') {
        return (baselineDistribution.alpha === undefined ||
          baselineDistribution.alpha === null ||
          baselineDistribution.alpha < 1 ||
          baselineDistribution.beta === undefined ||
          baselineDistribution.beta === null ||
          baselineDistribution.beta < 1);
      } else if (baselineDistribution.scale === 'mean') {
        return (baselineDistribution.mu === undefined ||
          baselineDistribution.mu === null ||
          baselineDistribution.sigma === undefined ||
          baselineDistribution.sigma === null ||
          baselineDistribution.sigma < 0);
      } else {
        return true;
      }

    }

    function alternativeSelectionChanged() {
      if ($scope.isModelBaseline) {
        $scope.arms = buildArms(problem);
        $scope.selections.armIdx = 0;
        $scope.armSelectionChanged();
      }
    }

    $scope.setBaselineDistribution = function(baselineDistribution) {
      if (baselineDistribution.selectedAlternative) {
        baselineDistribution.name = baselineDistribution.selectedAlternative.name;
      }
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
