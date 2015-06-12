'use strict';
define([], function() {
  var dependencies = ['$http', '$scope', '$location', 'AnalysesResource', 'ModelResource',
    '$modalInstance', 'FileUploadService'];
  var AddAnalysisController = function($http, $scope, $location, AnalysesResource, ModelResource,
    $modalInstance, FileUploadService) {

    $scope.analysis = {};
    $scope.problemFile = {};

    $scope.addAnalysis = function(analysis) {
      $scope.isAddingAnalysis = true;
      AnalysesResource.save(analysis, function(result, headers) {
        $http.get(headers().location).success(function(savedAnalysis) {
          ModelResource.save({
            analysisId: savedAnalysis.id
          }, {}, function(result, headers) {
            $modalInstance.close();
            $scope.isAddingAnalysis = false;
            $location.url(headers().location);
          });
        });
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.$watch('problemFile.contents', function(newValue, oldValue) {
      if (newValue && newValue != oldValue) {
        $scope.uploadResult = FileUploadService.processFile($scope.problemFile);
        if ($scope.uploadResult.isValid) {
          $scope.analysis.problem = $scope.uploadResult.problem;
        }
      }
    });


  };
  return dependencies.concat(AddAnalysisController);
});
