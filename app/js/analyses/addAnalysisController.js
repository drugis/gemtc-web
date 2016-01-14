'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$http', '$scope', '$location', 'AnalysisResource', 'ModelResource',
    '$modalInstance', 'FileUploadService', 'ProblemValidityService', 'AnalysisService'
  ];
  var AddAnalysisController = function($http, $scope, $location, AnalysisResource, ModelResource,
    $modalInstance, FileUploadService, ProblemValidityService, AnalysisService) {

    $scope.analysis = {};
    $scope.problemFile = {};
    $scope.isAddButtonDisabled = isAddButtonDisabled;
    $scope.addAnalysis = addAnalysis;
    $scope.addScale = addScale;
    $scope.cancel = cancel;
    $scope.isScaleIncompatible = isScaleIncompatible;

    $scope.$watch('problemFile.contents', function(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        $scope.uploadResult = FileUploadService.processFile($scope.problemFile);
        if ($scope.uploadResult.isValid) {
          $scope.analysis.problem = $scope.uploadResult.problem;
          $scope.scaleOptions = _.uniqBy(AnalysisService.createLikelihoodLinkOptions($scope.analysis.problem), 'analysisScale');
          $scope.selectedScale = $scope.scaleOptions.find(function(option) {
            return option.compatibility === 'compatible';
          });
        }
      }
    });

    function isAddButtonDisabled(analysis) {
      return !analysis ||
        !analysis.title ||
        !analysis.outcome ||
        !analysis.outcome.name ||
        !analysis.problem ||
        !!$scope.isAddingAnalysis ||
        isScaleIncompatible($scope.selectedScale);
    }

    function isScaleIncompatible() {
      return $scope.selectedScale && $scope.selectedScale.compatibility === 'incompatible';
    }

    function addAnalysis(analysis) {
      $scope.isAddingAnalysis = true;
      AnalysisResource.save(analysis, function(result, headers) {
        $modalInstance.close();
        $scope.isAddingAnalysis = false;
        $location.url(headers().location);
      });
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function addScale(scale) {
      $scope.selectedScale = scale;
      $scope.uploadResult.problem.relativeEffectData.scale = scale ? scale.analysisScale : undefined;
      var validity = ProblemValidityService.getValidity($scope.uploadResult.problem);
      if (validity.isValid) {
        $scope.analysis.problem = $scope.uploadResult.problem;
      }
    }

  };
  return dependencies.concat(AddAnalysisController);
});