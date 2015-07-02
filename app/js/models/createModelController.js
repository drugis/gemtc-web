'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', '$location', 'AnalysisResource', 'ModelResource', 'AnalysisService'];
  var CreateModelController = function($scope, $stateParams, $location, AnalysisResource, ModelResource, AnalysisService) {

    $scope.analysis = AnalysisResource.get($stateParams);
    AnalysisService.createPairwiseOptions($scope.analysis.$promise).then(function(result) {
      $scope.comparisonOptions = result;
    });

    $scope.model = {
      linearModel: 'fixed',
      modelType: 'network'
    };
    $scope.createModel = createModel;
    $scope.isAddButtonDisabled = isAddButtonDisabled;


    function isAddButtonDisabled(model) {
      return !model ||
        !model.title ||
        !!$scope.isAddingModel;
    }

    function createModel(model) {
      $scope.isAddingModel = true;
      model.modelType = {
        type: model.modelType
      };
      if (model.modelType.type === 'pairwise') {
        model.modelType.details = model.pairwiseComparison;
      }
      ModelResource.save($stateParams, model, function(result, headers) {
        $scope.isAddingAnalysis = false;
        // Call to replace is needed to have backbutton skip the createModel view when going back from the model View
        $location.url(headers().location).replace();
      });
    };

  }
  return dependencies.concat(CreateModelController);
});