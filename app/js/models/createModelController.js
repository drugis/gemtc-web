'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', '$location', 'AnalysisResource', 'ModelResource', 'AnalysisService', 'ProblemResource'];
  var CreateModelController = function($scope, $stateParams, $location, AnalysisResource, ModelResource, AnalysisService, ProblemResource) {


    var problemDefer = ProblemResource.get($stateParams);

    AnalysisService.createPairwiseOptions(problemDefer.$promise).then(function(result) {
      $scope.comparisonOptions = result;
    });

    $scope.model = {
      linearModel: 'random',
      modelType: {
        type: 'network'
      }
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
      if (model.modelType.type === 'pairwise') {
        model.modelType.details = {
          from: model.pairwiseComparison.from.name,
          to: model.pairwiseComparison.to.name
        };
      }
      var pureModel = _.omit(model, 'pairwiseComparison');
      ModelResource.save($stateParams, pureModel, function(result, headers) {
        $scope.isAddingAnalysis = false;
        // Call to replace is needed to have backbutton skip the createModel view when going back from the model View
        $location.url(headers().location).replace();
      });
    };

  }
  return dependencies.concat(CreateModelController);
});