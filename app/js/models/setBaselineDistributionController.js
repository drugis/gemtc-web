'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope',
    '$modalInstance',
    'AnalysisService',
    'outcomeWithAnalysis',
    'interventionInclusions',
    'setBaselineDistribution',
    'alternatives',
    'problem',
    'ModelService'
  ];
  var SetBaselineDistributionController = function($scope,
    $modalInstance,
    AnalysisService,
    outcomeWithAnalysis,
    interventionInclusions,
    setBaselineDistribution,
    alternatives,
    problem,
    ModelService) {
    $scope.isModelBaseline = !!problem;
    $scope.selections = {};
    $scope.outcomeWithAnalysis = outcomeWithAnalysis;
    $scope.armSelectionChanged = armSelectionChanged;
    $scope.alternativeSelectionChanged = alternativeSelectionChanged;

    $scope.isInValidBaseline = isInValidBaseline;

    var localAlternatives;

    if (!interventionInclusions) { // in gemtc there's no inclusions
      localAlternatives = alternatives;
    } else {
      localAlternatives = _.filter(alternatives, function(alternative) {
        return _.find(interventionInclusions, function(interventionInclusion) {
          return interventionInclusion.interventionId === alternative.id;
        });
      });
    }

    $scope.baselineDistribution = {
      selectedAlternative: localAlternatives[0]
    };
    $scope.baselineDistribution.scale = _.find(AnalysisService.LIKELIHOOD_LINK_SETTINGS, function(setting) {
      return setting.likelihood === outcomeWithAnalysis.selectedModel.likelihood &&
        setting.link === outcomeWithAnalysis.selectedModel.link;
    }).absoluteScale;

    if ($scope.isModelBaseline) {
      $scope.arms = ModelService.buildBaselineSelectionEvidence(problem, localAlternatives, $scope.baselineDistribution.scale);
      $scope.baselineDistribution.type = $scope.baselineDistribution.scale === 'log odds' ? 'dbeta-logit' : 'dt';
      $scope.selections.armIdx = 0;
      $scope.armSelectionChanged();
    } else {
      $scope.baselineDistribution.type = 'dnorm';
    }

    $scope.filteredAlternatives = _.filter(localAlternatives, function(alternative) {
      return $scope.arms[alternative.id].length;
    });

    function isInValidBaseline(baselineDistribution) {
      return ModelService.isInValidBaseline(baselineDistribution);
    }

    function armSelectionChanged() {
      var selectedArm = $scope.arms[$scope.baselineDistribution.selectedAlternative.id][$scope.selections.armIdx];
      var newBaselineDistribution = {
        selectedAlternative: $scope.baselineDistribution.selectedAlternative,
        scale: $scope.baselineDistribution.scale,
        name: selectedArm.alternativeName

      };
      if ($scope.baselineDistribution.type === 'dbeta-logit') {
        newBaselineDistribution.alpha = selectedArm.responders + 1;
        newBaselineDistribution.beta = selectedArm.sampleSize - selectedArm.responders + 1;
        newBaselineDistribution.type = 'dbeta-logit';
      } else if ($scope.baselineDistribution.type === 'dnorm') {
        newBaselineDistribution.mu = selectedArm.mu;
        newBaselineDistribution.sigma = selectedArm.sigma;
        newBaselineDistribution.type = 'dnorm';
      } else if ($scope.baselineDistribution.type === 'dt') {
        newBaselineDistribution.mu = selectedArm.mu;
        newBaselineDistribution.stdErr = selectedArm.stdErr;
        newBaselineDistribution.dof = selectedArm.sampleSize - 1;
        newBaselineDistribution.type = 'dt';
      } else {
        return;
      }
      $scope.baselineDistribution = newBaselineDistribution;
    }


    function alternativeSelectionChanged() {
      if ($scope.isModelBaseline) {
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
