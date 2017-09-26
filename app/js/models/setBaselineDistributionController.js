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
    // functions
    $scope.outcomeWithAnalysis = outcomeWithAnalysis;
    $scope.armSelectionChanged = armSelectionChanged;
    $scope.alternativeSelectionChanged = alternativeSelectionChanged;

    // init
    $scope.selections = {};
    $scope.isInValidBaseline = isInValidBaseline;

    var localAlternatives;

    $scope.summaryMeasureOptions = [{
      label: 'median survival',
      id: 'median'
    }, {
      label: 'mean survival',
      id: 'mean'
    }, {
      label: 'survival at time',
      id: 'survivalAtTime'
    }];

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

    var settings = _.find(AnalysisService.LIKELIHOOD_LINK_SETTINGS, function(setting) {
      return setting.likelihood === outcomeWithAnalysis.selectedModel.likelihood &&
        setting.link === outcomeWithAnalysis.selectedModel.link;
    });
    $scope.baselineDistribution.scale = settings.absoluteScale;
    $scope.baselineDistribution.link = settings.link;
    $scope.scaleLabel = $scope.baselineDistribution.scale === 'log odds' || 'hazard ratio' ? 'probability' : $scope.baselineDistribution.scale;

    $scope.arms = ModelService.buildBaselineSelectionEvidence(problem, localAlternatives,
      $scope.baselineDistribution.scale, $scope.baselineDistribution.link);
    $scope.isSurvival = $scope.baselineDistribution.scale === 'log hazard' && $scope.baselineDistribution.link === 'log';
    $scope.isMissingSampleSize = _.find($scope.arms, function(armList) {
      return _.find(armList, function(arm) {
        return arm.sampleSize === undefined;
      });
    });

    if ($scope.baselineDistribution.scale === 'log hazard') {
      if ($scope.baselineDistribution.link === 'cloglog') {
        $scope.baselineDistribution.type = 'dbeta-cloglog';
        $scope.distributionName = 'Beta';
      } else {
        $scope.baselineDistribution.type = 'dsurv';
        $scope.distributionName = 'Gamma';
      }
    } else if ($scope.isMissingSampleSize) {
      $scope.baselineDistribution.type = 'dnorm';
      $scope.distributionName = 'Normal';
    } else {
      $scope.baselineDistribution.type = $scope.baselineDistribution.scale === 'log odds' ? 'dbeta-logit' : 'dt';
      $scope.distributionName = $scope.baselineDistribution.scale === 'log odds' ? 'Beta' : 'Student\'s t';
    }

    $scope.selections.armIdx = 0;
    $scope.armSelectionChanged();
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
        newBaselineDistribution.sigma = $scope.isMissingSampleSize ? selectedArm.stdErr : selectedArm.sigma;
        newBaselineDistribution.type = 'dnorm';
      } else if ($scope.baselineDistribution.type === 'dt') {
        newBaselineDistribution.mu = selectedArm.mu;
        newBaselineDistribution.stdErr = selectedArm.stdErr;
        newBaselineDistribution.dof = selectedArm.sampleSize - 1;
        newBaselineDistribution.type = 'dt';
      } else if ($scope.baselineDistribution.type === 'dsurv') {
        newBaselineDistribution.alpha = selectedArm.responders + 0.001;
        newBaselineDistribution.beta = selectedArm.exposure + 0.001;
        newBaselineDistribution.type = 'dsurv';
        newBaselineDistribution.summaryMeasure = 'mean';
      } else if ($scope.baselineDistribution.type === 'dbeta-cloglog') {
        newBaselineDistribution.alpha = selectedArm.responders + 1;
        newBaselineDistribution.beta = selectedArm.sampleSize - selectedArm.responders + 1;
        newBaselineDistribution.type = 'dbeta-cloglog';
      } else {
        return;
      }
      $scope.baselineDistribution = newBaselineDistribution;
    }


    function alternativeSelectionChanged() {
      $scope.selections.armIdx = 0;
      $scope.armSelectionChanged();
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
      $modalInstance.close('cancel');
    };
  };
  return dependencies.concat(SetBaselineDistributionController);
});