'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'AnalysisService',
    'outcomeWithAnalysis',
    'interventionInclusions',
    'setBaselineDistribution',
    'alternatives',
    'problem',
    'ModelService'
  ];
  var SetBaselineDistributionController = function(
    $scope,
    $modalInstance,
    AnalysisService,
    outcomeWithAnalysis,
    interventionInclusions,
    setBaselineDistribution,
    alternatives,
    problem,
    ModelService
  ) {
    // functions
    $scope.outcomeWithAnalysis = outcomeWithAnalysis;
    $scope.armSelectionChanged = armSelectionChanged;
    $scope.alternativeSelectionChanged = alternativeSelectionChanged;
    $scope.valueChanged = valueChanged;

    // init
    $scope.selections = {};

    $scope.summaryMeasureOptions = [{
      label: 'none',
      id: 'none'
    }, {
      label: 'median survival',
      id: 'median'
    }, {
      label: 'mean survival',
      id: 'mean'
    }, {
      label: 'survival at time',
      id: 'survivalAtTime'
    }];

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

    var settings = _.find(AnalysisService.LIKELIHOOD_LINK_SETTINGS, function(setting) {
      return setting.likelihood === outcomeWithAnalysis.selectedModel.likelihood &&
        setting.link === outcomeWithAnalysis.selectedModel.link;
    });

    var baselineDistribution = {
      selectedAlternative: localAlternatives[0],
      scale: settings.absoluteScale
    };

    $scope.arms = ModelService.buildBaselineSelectionEvidence(problem, localAlternatives,
      settings.absoluteScale, settings.link);

    $scope.isMissingSampleSize = _.find($scope.arms, function(armList) {
      return _.find(armList, function(arm) {
        return arm.sampleSize === undefined;
      });
    });
    var baselineDistributionType = settings.getBaselineDistribution($scope.isMissingSampleSize);
    if (baselineDistributionType !== AnalysisService.NO_BASELINE_ALLOWED) {
      baselineDistribution.type = baselineDistributionType.type;
      $scope.distributionName = baselineDistributionType.scaleName;
    }

    $scope.scaleLabel = _.includes(['log odds', 'hazard ratio'], baselineDistribution.scale) ?
      'probability' : baselineDistribution.scale;
    $scope.isSurvival = baselineDistribution.type === 'dsurv';
    $scope.selections.armIdx = 0;
    $scope.baselineDistribution = baselineDistribution;
    armSelectionChanged();
    $scope.filteredAlternatives = _.filter(localAlternatives, function(alternative) {
      return $scope.arms[alternative.id].length;
    });
    $scope.hasInValidBaseline = true;
    
    function armSelectionChanged() {
      var selectedArm = $scope.arms[$scope.baselineDistribution.selectedAlternative.id][$scope.selections.armIdx];
      if (!selectedArm) {
        return {
          scale: $scope.baselineDistribution.scale,
          type: $scope.baselineDistribution.type
        };
      }
      var newBaselineDistribution = {
        selectedAlternative: $scope.baselineDistribution.selectedAlternative,
        scale: $scope.baselineDistribution.scale,
        name: selectedArm.alternativeName
      };
      switch ($scope.baselineDistribution.type) {
        case 'dbeta-logit':
          newBaselineDistribution.alpha = selectedArm.responders + 1;
          newBaselineDistribution.beta = selectedArm.sampleSize - selectedArm.responders + 1;
          newBaselineDistribution.type = 'dbeta-logit';
          break;
        case 'dnorm':
          newBaselineDistribution.mu = selectedArm.mu;
          newBaselineDistribution.sigma = $scope.isMissingSampleSize ? selectedArm.stdErr : selectedArm.sigma;
          newBaselineDistribution.type = 'dnorm';
          break;
        case 'dt':
          newBaselineDistribution.mu = selectedArm.mu;
          newBaselineDistribution.stdErr = selectedArm.stdErr;
          newBaselineDistribution.dof = selectedArm.sampleSize - 1;
          newBaselineDistribution.type = 'dt';
          break;
        case 'dsurv':
          newBaselineDistribution.alpha = selectedArm.responders + 0.001;
          newBaselineDistribution.beta = selectedArm.exposure + 0.001;
          newBaselineDistribution.type = 'dsurv';
          newBaselineDistribution.summaryMeasure = 'none';
          break;
        case 'dbeta-cloglog':
          newBaselineDistribution.alpha = selectedArm.responders + 1;
          newBaselineDistribution.beta = selectedArm.sampleSize - selectedArm.responders + 1;
          newBaselineDistribution.type = 'dbeta-cloglog';
          break;
        default:
          return;
      }
      $scope.baselineDistribution = newBaselineDistribution;
      valueChanged();
    }

    function valueChanged() {
      $scope.hasInValidBaseline = ModelService.isInValidBaseline($scope.baselineDistribution);
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
